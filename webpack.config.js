const path = require('path');
const FileCopy = require('copy-webpack-plugin');

module.exports = [
	{
		resolve: {
			extensions: ['.js'],
			alias: {
				'@css': path.resolve(__dirname, 'src/css/'),
				'@': path.resolve(__dirname, 'src/'),
			},
		},
		entry: './src/index.js',
		name: 'DEBUG',
		mode: 'development',
		plugins: [new FileCopy({patterns: [{from: './src/index.html'}]})],
		output: {
			filename: '[name].bundle.js',
			path: path.resolve(__dirname, 'bin/debug'),
		},
		devtool: 'eval-source-map',
		devServer: {
			static: {directory: path.join(__dirname, 'bin')},
			port: 7777,
		},
	},
];
