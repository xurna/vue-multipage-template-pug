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


## 提升webpack构建速度
  - 使用缓存：
  1. 可以用cache-loader
  ` npm install --save-dev cache-loader`
  ```js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['babel-loader', 'cache-loader',],
          include: [appDir],
          exclude: [nodeModuleDir]
        },
      ],
    },
  };
  ```
  2. 其他plugin也有相对应的开启cashe的属性，如teserPlugin等

  - 多核：使用happypack，通过id关联
  `npm install --save-dev happypack`
  注意：
  1. MiniCssExtractPlugin 无法与 happypack 共存
  2. MiniCssExtractPlugin 必须置于 cache-loader 执行之后，否则无法生效
  ```js
  const HappyPack = require('happypack');
  // 拿到系统CPU的最大核数，happypack 将编译工作灌满所有线程
  const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
  module.exports = {
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['happypack/loader?id=js'],
          include: [appDir],
          exclude: [nodeModuleDir]
        },
        {
          test: /\.(le|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader, 
            'happypack/loader?id=styles'
          ],
          include: [appDir],
          exclude: [nodeModuleDir]
        },
      ]
    },
    plugins: [
      new HappyPack({
        id: 'js',
        threads: 4,
        loaders: ['babel-loader','cache-loader']
      }),
      new HappyPack({
        id: 'styles',
        threads: happyThreadPool,
        loaders: [ 
          'cache-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2, // 0 => no loaders (default); 2 => postcss-loader, less-loader
            },
          },
          'postcss-loader',
          'less-loader', // 位置不可与less-loader反过来，因为是从下到上做处理的
        ],
      }),
    ],
  }
  ```

- 抽离：使用webpack-dll-plugin和externals
externals与dll的区别：dll将资源都打包成一个包，externals则是分开每一个资源文件，分包下载会更快

  - webpack-dll-plugin：需要新建一个webpack.dll.conf.js文件，配置`webpack.DllPlugin`:
  ```js
  // webpack.dll.conf.js
  const webpack = require('webpack');
  const path = require('path');
  const TerserPlugin = require('terser-webpack-plugin')
  const { CleanWebpackPlugin } = require('clean-webpack-plugin')
  const AssetsPlugin = require('assets-webpack-plugin')

  module.exports = {
      entry: {
          vendor: ['axios', 'vue', 'vue-router'],
      },
      output: {
          path: path.join(__dirname, '../dll'),
          filename: '[name]_dll.[hash:8].js',
          library: '_dll_[name]',
      },
      plugins: [
          new CleanWebpackPlugin(),
          new webpack.DllPlugin({
              path: path.join(__dirname, '../dll', '[name]_manifest.json'),
              name: '_dll_[name]', // 与上面output中library配置对应
          }),
          new AssetsPlugin({ // 生成入口文件打包后对应文件隐射，方便后面去区文件名
              filename: 'bundle-conf.json',
              path: __dirname
          }),
      ],
      optimization: {
          minimizer: [
              new TerserPlugin({
                  cache: true,
                  parallel: true, // 开启并行压缩，充分利用cpu
                  sourceMap: false,
                  terserOptions: {
                      compress: { drop_console: true },
                  }
              }),
          ],
      },
  };
  ```
  修改webpack.prod.conf.js，添加对应的webpack.DllReferencePlugin配置：
  ```js
  module.exports = {
    plugins: [
        new webpack.DllReferencePlugin({
          manifest: path.join(__dirname, '../dll', 'vendor_manifest.json') // 对应webpack.dll.conf.js中生成的那个json文件的路径
        }),
        new HtmlWebpackPlugin({
          ...
          dll: `${assestPathName}/js/${CommonsPkg.vendor.js}`,,
          ...
        }),
  }
  ```
  修改html模板，插入js：
  ```html
  <script type=text/javascript src="<%= htmlWebpackPlugin.options.dll %>"></script>
  ```
  packag.json文件添加打包命令：
  ```
  "dll": "webpack --progress --config ./build/webpack.dll.conf.js"
  ```

  - externals：
  ```js
  module.exports = {
    ...,
    externals: {
      // key是我们 import 的包名，value 是CDN为我们提供的全局变量名
      // 所以最后 webpack 会把一个静态资源编译成：module.export.react = window.React
      "react": "React",
      "react-dom": "ReactDOM",
      "redux": "Redux",
      "react-router-dom": "ReactRouterDOM"
    }
  }
  ```
- 拆分：我们经常打包的项目是SPA，但也有MPA的，可以尝试docker集群编译，因为我们知道，webpack 会将一个 entry 视为一个 chunk，并在最后生成文件时，将 chunk 单独生成一个文件。所以将单个 entry 剥离出来维护一个独立的构建流程，并在一个容器内执行，待构建完成后，将生成文件打进指定目录。


