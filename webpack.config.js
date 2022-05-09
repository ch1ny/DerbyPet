const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	devServer: {
		static: path.join(__dirname, 'public'),
		host: '127.0.0.1',
		port: 3000,
	},
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
		alias: {
			Assets: path.join(__dirname, 'src/Assets'),
			Components: path.join(__dirname, 'src/Components'),
			Pages: path.join(__dirname, 'src/Pages'),
			Utils: path.join(__dirname, 'src/Utils'),
			Views: path.join(__dirname, 'src/Views'),
		},
	},
	entry: {
		main: './src/Views/Main/index.tsx',
	},
	output: {
		path: path.resolve(__dirname, './build'),
		filename: '[name]/index.[chunkhash:8].js',
	},
	module: {
		rules: [
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					'style-loader',
					'css-loader',
					'resolve-url-loader',
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				test: /\.tsx?$/,
				exclude: /(node_modules|bower_components)/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
			{
				test: /\.(png|jpg|gif|ico)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							esModule: false,
							limit: 1024, //对图片的大小做限制，1kb
						},
					},
				],
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			filename: 'main/index.html',
			chunks: ['main'],
			template: './public/index.html',
		}),
	],
};
