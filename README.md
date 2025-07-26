# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Running the project locally

1. Install Node.js (version 18 or newer).
2. Run `npm install --legacy-peer-deps` to install dependencies.
3. Start the dev server with `npm run dev`.
4. Visit `http://localhost:5173` in your browser. The server proxies API requests to `http://localhost:5212` as defined in `vite.config.ts`.
5. For a production build, run `npm run build` and then `npm run preview` to preview it locally.

### 中文指南

1. 安装 Node.js（建议 18 及以上版本）。
2. 执行 `npm install --legacy-peer-deps` 安装依赖。
3. 运行 `npm run dev` 启动开发服务器。
4. 在浏览器打开 `http://localhost:5173` 查看项目效果，开发服务器会按照 `vite.config.ts` 的配置代理到 `http://localhost:5212`。
5. 使用 `npm run build` 构建生产版本，随后通过 `npm run preview` 在本地预览。


