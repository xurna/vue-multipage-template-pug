# vue-multipage-template
vue多页项目模板，基于pug模板引擎

## 运行
- 安装依赖：`npm install`
- 开发：`npm run dev`，打开页面：`http://x.x.x.x:9001/home`
- 上线打包：`npm run build`

## vue单页改成多页步骤
本项目基于另外两个项目修改而来，对于`webpack配置`及`vue由单页改成多页步骤`不清楚的可以到以下两个仓库中查询。
- [vue单页项目环境搭建，附webpack4+详解](https://github.com/xurna/vue-template)
- [vue单页到多页项目配置](https://github.com/xurna/vue-multipage-template)


## 使用pug模板引擎
- 安装依赖
  ```
  npm install -save-dev pug pug-loader
  ```
- 修改webpack配置
  - webpack.common.conf.js，增加`pug-loader`
    ```js
    module: {
      rules: [
        ...
        {
          test: /\.pug$/,
          loader: 'pug-loader'
        },
      ]
    },
    ```
  - webpack.dev.conf.js & webpack.prod.conf.js，修改入口文件后缀
    ```js
    - let entryHtml = glob.sync(PAGE_PATH + '/*/*.html')
    + let entryHtml = glob.sync(PAGE_PATH + '/*/*.pug')
    ```
- 修改页面模板
   ```js
  .
  ├── README.md
  ├── app // 前端目录
        ├── assets
        │   ├── images
        │   ├── js
        │   ├── layout
        │   │     └── base.pug // 新增公共pug
        │   └── less
        ├── components
        └── pages
            ├── home
            │   ├── detail.vue
            │   ├── home.pug  // 修改文件后缀及内容
            │   ├── home.js
            │   └── main.vue
            └── user
                ├── main.vue
                ├── user.pug  // 修改文件后缀及内容
                └── user.js

  ```

