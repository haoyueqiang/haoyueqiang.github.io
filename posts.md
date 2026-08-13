---
title: 全部笔记
permalink: /posts/
eyebrow: ALL NOTES
description: 按发布时间浏览全部技术笔记。也可以回到首页组合使用搜索、分类、标签和日期筛选。
---

<div class="post-list-compact">
{% for post in site.posts %}
  <a href="{{ post.url | relative_url }}">
    <time>{{ post.date | date: "%Y.%m.%d" }}</time>
    <span><b>{{ post.title }}</b><small>{{ post.category | default: post.categories[0] }}{% if post.stack %} · {{ post.stack }}{% endif %}</small></span>
    <i aria-hidden="true">↗</i>
  </a>
{% endfor %}
</div>

