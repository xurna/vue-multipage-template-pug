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