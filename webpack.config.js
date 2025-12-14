const path = require('path');
const FileCopy = require('copy-webpack-plugin');

const shared = {
	resolve: {
		extensions: ['.js'],
		alias: {
			'@css': path.resolve(__dirname, 'src/css/'),
			'@': path.resolve(__dirname, 'src/'),
		},
	},
	entry: './src/index.js',
	plugins: [new FileCopy({patterns: [
		{from: './src/index.html'},
		{from: './src/pages/welcome/pokeball.png'},
		{from: './fonts/*'},
	]})],
};

module.exports = [
	{
		...shared,
		name: 'DEBUG',
		mode: 'development',
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
	{
		...shared,
		name: 'RELEASE',
		mode: 'production',
		output: {
			filename: '[name].bundle.js',
			path: path.resolve(__dirname, 'bin/release'),
		},
	},
];
