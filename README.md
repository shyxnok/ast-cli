# ast-halcyon

Astro 快捷命令行工具 + Halcyon 主题，像 Hexo 一样操作 Astro。

## 安装

```bash
npm install -g ast-halcyon
```

## CLI 命令

```bash
ast s              # 启动开发服务器 (默认端口 54485)
ast g              # 构建静态站点
ast d              # 构建并部署
ast n "文章标题"    # 新建博客文章
```

## Halcyon 主题

在 `astro.config.mjs` 中引入：

```js
import halcyonTheme from 'ast-halcyon/theme';

export default defineConfig({
  integrations: [halcyonTheme()],
});
```

启动时输出 Hexo 风格的 INFO/WARN/ERROR 日志，自动过滤噪音。

## 许可

MIT
