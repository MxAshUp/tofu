const { DefinePlugin } = require('webpack');
const path = require('path');

module.exports = (entryPoint, outputPath, debug = true, production = false) => {

  if(!entryPoint) {
    throw new Error(`entryPoint must be defined`);
  }

  if(!outputPath) {
    throw new Error('outputPath must be defined');
  }

  return {
    mode: production ? 'production' : 'development',
    entry: [
      entryPoint,
    ],
    output: {
      path: path.dirname(outputPath),
      filename: path.basename(outputPath)
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src')
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
      ]
    },
    plugins: [
      new DefinePlugin({
        DEBUG: !!debug,
      })
    ]
  };
};