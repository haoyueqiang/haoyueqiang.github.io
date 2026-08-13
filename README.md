# 郝跃强 · 技术笔记

基于 GitHub Pages 与 Jekyll 的个人技术博客。文章使用 Markdown 编写，网站会自动生成技术分类、标签索引、关键词搜索与日期日历。

## 写一篇新文章

1. 复制 `_drafts/article-template.md`。
2. 放入 `_posts/技术方向/技术栈/`，文件名使用 `YYYY-MM-DD-english-slug.md`。
3. 修改文章头部的 `title`、`description`、`date`、`category`、`stack` 与 `tags`。
4. 编写正文并提交到 `main` 分支。

建议分类：`后端`、`Java`、`Python`、`前端`、`工程实践`。

## 本地预览

```bash
bundle install
bundle exec jekyll serve
```

打开 `http://127.0.0.1:4000`。

## 目录说明

- `_posts/`：正式发布的 Markdown 技术笔记
- `_drafts/`：草稿与文章模板
- `_layouts/`：页面布局
- `_includes/`：可复用页面组件
- `assets/`：样式、交互和图片
- `archive.md`：日历归档页
- `tags.md`：标签索引页

