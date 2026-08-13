---
title: "从这里开始：如何维护这座技术知识库"
description: "这篇说明介绍文章目录、Front Matter 字段、分类标签和本地预览方式，写完 Markdown 即可被网站自动索引。"
date: 2026-08-13 10:00:00 +0800
category: 工程实践
stack: Jekyll
tags: [写作规范, Markdown, Jekyll]
---

这个网站已经把内容与界面分开。以后写作时只需要在 `_posts` 目录新增 Markdown 文件，首页、标签页与日期归档都会自动更新。

## 文章放在哪里

推荐使用下面的目录结构：

```text
_posts/
├── backend/
│   ├── java/
│   └── python/
├── frontend/
└── engineering/
```

文件名必须使用 `年-月-日-英文短标题.md`，例如：

```text
2026-08-13-spring-boot-cache.md
```

## 文章头部怎么写

每篇文章最前面需要一段 YAML 信息：

```yaml
---
title: "Spring Boot 缓存实践"
description: "文章摘要，会显示在首页卡片与搜索结果中。"
date: 2026-08-13 10:00:00 +0800
category: Java
stack: Spring Boot
tags: [Spring Boot, Redis, 缓存]
---
```

`category` 建议固定使用“后端、Java、Python、前端、工程实践”之一，便于首页分类筛选。`tags` 可以自由扩展，适合标注框架、组件与具体主题。

## 如何开始一篇新文章

复制 `_drafts/article-template.md` 到对应的 `_posts` 子目录，修改文件名与头部信息，然后用 Markdown 编写正文即可。提交到 GitHub 后，GitHub Pages 会自动重新构建站点。

## 写作建议

一篇可长期复用的技术笔记，最好同时包含问题背景、定位过程、解决方案和验证结果。对于会随版本变化的内容，请在头部填写 `updated` 字段，并在正文中标明适用版本。

