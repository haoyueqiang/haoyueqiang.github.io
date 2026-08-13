---
title: 日期归档
permalink: /archive/
eyebrow: NOTES CALENDAR
description: 选择年月和日期，查看那一天发布的技术笔记。
---

<div class="calendar-app" data-calendar>
  <section class="calendar-panel">
    <header><button type="button" data-calendar-prev aria-label="上个月">←</button><h2 data-calendar-title></h2><button type="button" data-calendar-next aria-label="下个月">→</button></header>
    <div class="calendar-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>
    <div class="calendar-days" data-calendar-days></div>
    <footer><button type="button" data-calendar-today>回到最新月份</button><span><i></i> 有笔记发布</span></footer>
  </section>
  <section class="calendar-results">
    <header><p class="eyebrow">SELECTED DATE</p><h2 data-calendar-selection>全部笔记</h2><span data-calendar-count>{{ site.posts | size }} 篇</span></header>
    <div data-calendar-list>
      {% for post in site.posts %}
      <a class="calendar-post" href="{{ post.url | relative_url }}" data-calendar-post data-date="{{ post.date | date: '%Y-%m-%d' }}">
        <time>{{ post.date | date: "%m.%d" }}</time><span><b>{{ post.title }}</b><small>{{ post.category | default: post.categories[0] }} · {{ post.tags | join: ' / ' }}</small></span><i>↗</i>
      </a>
      {% endfor %}
    </div>
    <p class="calendar-empty" data-calendar-empty hidden>这一天还没有发布笔记。</p>
  </section>
</div>

