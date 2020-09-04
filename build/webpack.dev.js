/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-10 17:12:18
 * @LastEditTime: 2019-08-11 18:13:51
 * @LastEditors: Please set LastEditors
 */
const merge = require('webpack-merge');
const common = require('./webpack.base.js');
const path = require('path');
const timeDelay = 20;
const timeDelayInMs = timeDelay * 1000;
const fs = require('fs');
const bodyParser = require('body-parser');
const apiMocker = require('webpack-api-mocker');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        contentBase: '../dist',
        before: function (app, server) {
            apiMocker(app, path.resolve('build/api.js'));
            // app.use(bodyParser.json());
            // app.get('/sw-report-crash', (req, res) => {
            //     res.header(
            //         'Content-Type',
            //         'application/javascript; charset=UTF-8'
            //     );
            //     res.header('Service-Worker-Allowed', '/');
            //     let sw = fs.readFileSync('src/serviceWorker/sw.js');
            //     res.send(sw);
            // });
            // app.use(bodyParser.json()).post('/crash/report', (req, res) => {
            //     console.log('in crash/report', req.body);
            // });
            app.get('/delay/rsp', function (req, res) {
                let delay = 20;
                try {
                    // console.log('req.query = ', req.query)
                    // console.log('req.query.params = ', req.query.params)
                    // console.log('typeof req.query.params = ', typeof req.query.params)
                    // console.log('req.query.params.delay = ', req.query.params.delay)
                    delay = JSON.parse(req.query.params).delay;
                } catch (error) { }
                // console.log('delay = ', delay)
                setTimeout(() => {
                    res.json({ custom: 'response' });
                }, delay * 1000);
            });

            app.get('/immediate/rsp', function (req, res) {
                res.json({ custom: 'response' });
            });
            app.post('/immediate/post/rsp', function (req, res) {
                res.json({ custom: 'response' });
            });
        },
    },
    output: {
        filename: 'js/[name].[hash].js',
        // filename: 'js/[name].js',
        path: path.resolve(__dirname, '../dist'),
    },
    externals: {
        vue: 'Vue',
        'element-ui': 'ELEMENT',
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    // 'postcss-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    // 'postcss-loader',
                    'less-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            limit: 5000,
                            name: 'imgs/[name].[ext]',
                            // publicPath: '../'
                        },
                    },
                ],
            },
        ],
    },
    mode: 'development',
});
