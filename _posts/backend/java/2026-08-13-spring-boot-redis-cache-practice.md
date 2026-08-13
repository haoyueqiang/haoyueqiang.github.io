---
title: "Spring Boot + Redis 缓存实践：解决热点查询与缓存击穿"
description: "以商品详情接口为例，记录从本地数据库直查到 Redis 缓存、互斥重建和空值保护的完整实现过程。"
date: 2026-08-13 11:30:00 +0800
category: Java
stack: Spring Boot
tags: [Spring Boot, Redis, 缓存, MySQL, 性能优化]
updated: 2026-08-13
---

> 本文使用一个模拟的商品详情接口演示缓存改造。测试数据为模拟结果，代码结构可以直接迁移到常见的 Spring Boot 项目中。

## 问题背景

商品详情接口最初直接查询 MySQL。日常流量下响应时间可以接受，但在一次模拟促销压测中，少量热门商品占据了大部分请求，数据库连接池很快达到上限。

测试环境如下：

| 项目 | 配置 |
| --- | --- |
| 应用 | Spring Boot 3.3、Java 21 |
| 数据库 | MySQL 8.0，连接池上限 30 |
| 缓存 | Redis 7.2，单实例 |
| 压测 | 500 并发，持续 5 分钟 |

改造前主要指标：

- 商品详情接口 P95 响应时间约为 680 ms；
- MySQL 每秒查询约为 3,200 次；
- 热门商品缓存失效瞬间，应用会出现短时间超时；
- 不存在的商品 ID 会重复访问数据库。

## 整体方案

在应用与 MySQL 之间增加 Redis。普通请求优先读取缓存；缓存未命中时，只允许一个请求获得互斥锁并重建缓存，其他请求进行短暂退避后重试。

![Spring Boot Redis 缓存架构图]({{ '/assets/images/posts/2026/08/spring-boot-redis-cache/architecture.png' | relative_url }})

图中的关键点有三个：

1. Redis 保存商品详情，承担绝大部分热点读取；
2. 分布式互斥锁控制同一商品的缓存重建并发数；
3. 空值缓存拦截不存在的商品 ID，避免持续穿透到数据库。

## 缓存数据结构

缓存键按照业务、版本和数据 ID 组织，便于后续升级数据结构：

```text
product:detail:v1:{productId}
product:detail:lock:{productId}
```

商品缓存使用 JSON 字符串保存，正常数据过期时间为 30 分钟，并加入 0～5 分钟的随机偏移，避免大量键在同一时刻失效。空值缓存只保留 2 分钟。

```yaml
cache:
  product-detail:
    ttl: 30m
    random-offset: 5m
    null-ttl: 2m
    lock-ttl: 10s
```

## 核心实现

先定义商品查询服务。下面代码省略了日志和序列化异常处理，只保留缓存流程的关键部分。

```java
@Service
@RequiredArgsConstructor
public class ProductQueryService {

    private static final String CACHE_PREFIX = "product:detail:v1:";
    private static final String LOCK_PREFIX = "product:detail:lock:";
    private static final String NULL_VALUE = "__NULL__";

    private final StringRedisTemplate redisTemplate;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    public ProductDetail queryById(Long productId) {
        String cacheKey = CACHE_PREFIX + productId;
        String cached = redisTemplate.opsForValue().get(cacheKey);

        if (StringUtils.hasText(cached)) {
            if (NULL_VALUE.equals(cached)) {
                throw new ProductNotFoundException(productId);
            }
            return readValue(cached);
        }

        return rebuildCache(productId, cacheKey);
    }
}
```

缓存未命中时尝试获取互斥锁。锁必须设置过期时间，并且释放锁时要校验持有者标识，不能直接删除其他线程重新获得的锁。

```java
private ProductDetail rebuildCache(Long productId, String cacheKey) {
    String lockKey = LOCK_PREFIX + productId;
    String lockValue = UUID.randomUUID().toString();
    Boolean locked = redisTemplate.opsForValue()
        .setIfAbsent(lockKey, lockValue, Duration.ofSeconds(10));

    if (!Boolean.TRUE.equals(locked)) {
        sleep(Duration.ofMillis(50));
        return queryById(productId);
    }

    try {
        // 获得锁后再次检查，避免等待期间缓存已被其他线程写入。
        String doubleChecked = redisTemplate.opsForValue().get(cacheKey);
        if (StringUtils.hasText(doubleChecked)) {
            return NULL_VALUE.equals(doubleChecked)
                ? throwNotFound(productId)
                : readValue(doubleChecked);
        }

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            redisTemplate.opsForValue()
                .set(cacheKey, NULL_VALUE, Duration.ofMinutes(2));
            throw new ProductNotFoundException(productId);
        }

        ProductDetail detail = ProductDetail.from(product);
        Duration ttl = Duration.ofMinutes(30 + ThreadLocalRandom.current().nextInt(6));
        redisTemplate.opsForValue().set(cacheKey, writeValue(detail), ttl);
        return detail;
    } finally {
        releaseLock(lockKey, lockValue);
    }
}
```

释放锁使用 Lua 脚本完成“判断持有者并删除”的原子操作：

```lua
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
end
return 0
```

## 一次请求如何执行

下面的时序图展示了缓存命中和缓存失效后的主要路径。

![商品详情缓存读取时序图]({{ '/assets/images/posts/2026/08/spring-boot-redis-cache/request-flow.png' | relative_url }})

实现时要注意获得锁后的二次检查。如果没有二次检查，排队等待的请求仍可能依次访问数据库，互斥锁只能降低并发，不能真正消除重复查询。

## 主动更新缓存

商品被修改时采用“先更新数据库，再删除缓存”的策略，不直接覆盖缓存：

```java
@Transactional
public void updateProduct(UpdateProductCommand command) {
    productRepository.update(command);
    redisTemplate.delete(CACHE_PREFIX + command.productId());
}
```

删除失败时，将缓存删除事件写入消息队列进行重试。对一致性要求更高的业务，还可以订阅数据库变更日志完成缓存失效，但系统复杂度也会随之增加。

## 验证结果

使用相同脚本重新进行 500 并发压测，得到以下模拟结果：

| 指标 | 改造前 | 改造后 |
| --- | ---: | ---: |
| P95 响应时间 | 680 ms | 42 ms |
| MySQL 每秒查询 | 3,200 | 86 |
| 缓存命中率 | 0% | 97.4% |
| 接口错误率 | 3.8% | 0.05% |

缓存失效测试中，同一个商品收到 300 个并发请求时，MySQL 实际只执行了一次商品查询。对随机不存在 ID 的请求也只会在空值缓存过期后访问一次数据库。

## 仍需关注的问题

- Redis 故障时需要快速失败或临时降级，避免所有请求长时间等待缓存连接；
- 递归重试必须设置次数上限和随机退避，防止锁持有时间过长导致栈溢出；
- 热点数据可以在过期前异步刷新，进一步减少请求等待；
- 缓存中不要保存无界增长的大对象或敏感字段；
- 指标系统应持续观察命中率、重建次数、锁等待时间和数据库回源量。

## 总结

Redis 缓存并不只是为查询结果设置过期时间。一个可投入使用的方案还要同时处理缓存击穿、缓存穿透、批量过期、更新一致性和缓存故障。建议先从监控数据确认真实瓶颈，再根据业务一致性要求选择复杂度合适的实现。

