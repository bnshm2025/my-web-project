const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './frontend/index.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'bundle.[contenthash].js', // Tên file JS có contenthash giúp quản lý cache
            publicPath: '/', // Đảm bảo các asset luôn được tải đúng vị trí
            assetModuleFilename: 'images/[name].[hash][ext]', // Tối ưu hóa tên hình ảnh
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader'],
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // Tải CSS theo cách tối ưu
                        'css-loader',
                    ],
                },
                {
                    test: /\.(ico|png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/[name].[hash][ext]', // Đưa favicon vào thư mục assets với hash
                    },
                },
            ],
        },
        optimization: {
            minimize: isProduction, // Chỉ tối ưu hóa trong môi trường sản phẩm
            splitChunks: {
                chunks: 'all', // Tách các mã chung như React, lodash vào các file riêng biệt
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors', // Chia các thư viện bên ngoài thành một bundle riêng
                        chunks: 'all',
                    },
                },
            },
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true, // Loại bỏ console.log trong sản phẩm
                            passes: 2, // Tối ưu hóa lần nữa (2 lần nén)
                            drop_debugger: true,
                        },
                        mangle: true, // Rút gọn tên biến
                    },
                    extractComments: false, // Không tách comment ra ngoài
                }),
            ],
        },
        plugins: [
            new CleanWebpackPlugin(), // Xóa thư mục build trước khi tạo lại
            new HtmlWebpackPlugin({
                template: './public/index.html',
                favicon: './public/favicon.ico',
                minify: isProduction
                    ? {
                          removeComments: true,
                          collapseWhitespace: true,
                          removeRedundantAttributes: true,
                          useShortDoctype: true,
                          removeEmptyAttributes: true,
                          removeStyleLinkTypeAttributes: true,
                          keepClosingSlash: true,
                          minifyJS: true,
                          minifyCSS: true,
                          minifyURLs: true,
                      }
                    : false, // Không minify trong môi trường phát triển
            }),
            ...(isProduction
                ? [
                      // Bảo vệ mã nguồn trong sản phẩm
                      new WebpackObfuscator({ rotateStringArray: true }, ['excluded_bundle.js']),
                      // Tách CSS ra khỏi bundle JS trong sản phẩm
                      new MiniCssExtractPlugin({
                          filename: 'styles/[name].[contenthash].css',
                      }),
                      // Phân tích kích thước bundle (bạn có thể bật lên để kiểm tra)
                      new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
                  ]
                : []),
        ],
        devtool: isProduction ? false : 'source-map', // Tắt source-map trong sản phẩm để bảo mật
        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            compress: true,
            port: 8080,
            hot: true, // Hỗ trợ live-reload trong phát triển
            open: true, // Tự động mở trình duyệt khi chạy devServer
            historyApiFallback: true, // Đảm bảo các route của React Router vẫn hoạt động
        },
    };
};
