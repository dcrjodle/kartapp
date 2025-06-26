const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  // Load environment variables from .env.local
  const envPath = path.resolve(__dirname, '.env.local');
  const fileEnv = dotenv.config({ path: envPath }).parsed || {};
  
  // Combine with process.env and filter REACT_APP_ variables
  const envVars = Object.keys({ ...process.env, ...fileEnv })
    .filter(key => key.startsWith('REACT_APP_'))
    .reduce((acc, key) => {
      acc[`process.env.${key}`] = JSON.stringify((fileEnv[key] || process.env[key]) || '');
      return acc;
    }, {});
  
  // Debug: Log environment variables being injected
  console.log('Environment variables found:', Object.keys(envVars));
  console.log('API Key present:', !!envVars['process.env.REACT_APP_LLM_API_KEY']);
  
  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].bundle.js',
      chunkFilename: isProduction ? '[name].[contenthash].js' : '[name].chunk.js',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.scss', '.css'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        minify: isProduction,
      }),
      new webpack.DefinePlugin(envVars),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
      usedExports: true,
      sideEffects: false,
    },
    devServer: {
      static: path.join(__dirname, 'dist'),
      compress: true,
      port: 3001,
      open: true,
    },
    mode: argv.mode || 'development',
  };
};