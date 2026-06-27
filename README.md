# ast-cli

Astro 快捷命令行工具，像 Hexo 一样操作 Astro。

## 安装

```bash
npm install -g github:shyxnok/ast-cli
```

## 使用

```bash
ast s              # 启动开发服务器 (astro dev)
ast g              # 构建静态站点 (astro build)
ast d              # 构建并部署
ast n "文章标题"    # 新建博客文章
```

### 命令对照

| ast | 等同于 | 说明 |
|-----|--------|------|
| `ast s` | `astro dev` | 启动开发服务器，静默模式只显示错误 |
| `ast g` | `astro build` | 构建生产版本 |
| `ast d` | `astro build` + 部署 | 先构建再推送到 GitHub Pages |
| `ast n "标题"` | — | 在 `src/content/blog/` 下创建新文章 |

## 许可

MIT
