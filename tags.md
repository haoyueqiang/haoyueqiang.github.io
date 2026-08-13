---
title: 标签索引
permalink: /tags/
eyebrow: TOPIC MAP
description: 从具体技术主题出发，沿着标签发现相关笔记。
---

<div class="tag-cloud">
{% assign tags_sorted = site.tags | sort %}
{% for tag in tags_sorted %}<a href="#{{ tag[0] | slugify }}">#{{ tag[0] }} <span>{{ tag[1] | size }}</span></a>{% endfor %}
</div>
<div class="tag-sections">
{% for tag in tags_sorted %}
<section id="{{ tag[0] | slugify }}"><header><h2>#{{ tag[0] }}</h2><span>{{ tag[1] | size }} 篇</span></header>
  {% for post in tag[1] %}<a href="{{ post.url | relative_url }}"><time>{{ post.date | date: "%Y.%m.%d" }}</time><b>{{ post.title }}</b><span>↗</span></a>{% endfor %}
</section>
{% endfor %}
</div>

