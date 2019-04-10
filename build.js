const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const webpackConfig = require('./webpack.config');
const webpack = promisify(require('webpack'));
const tmp = require('tmp');
const formatOutput = require('./src/output');
const exec = promisify(require('child_process').exec);

const distPath = path.resolve(__dirname, './dist/');
const distJSPath = path.resolve(distPath, './format.js');
const docsDistPath = path.resolve(__dirname, './docs/dist/');
const docsDistJsPath = path.resolve(docsDistPath, './format.js');

const tmpDir = (options = {}) => new Promise((resolve, reject) => {
  tmp.dir(options, (err, dir, cleanup) => {
    if(err) return reject(err);
    return resolve({dir, cleanup});
  });
});

const production = (process.env.PRODUCTION || '').toLowerCase() === 'true' ? true : false;
const debug = (process.env.DEBUG || '').toLowerCase() === 'true' ? true : false;

const appSrcPath = path.resolve(__dirname, './src/main.js');
const templatePath = path.resolve(__dirname, './src/template.html');

(async () => {

  const { dir, cleanup } = await tmpDir({unsafeCleanup: true});
  try {

    const appBuildPath = path.resolve(dir, './js-dist.js');

    // Webpack for JS bundling
    const stats = await webpack(webpackConfig(appSrcPath, appBuildPath, debug, production));

    const info = stats.toJson();

    if (stats.hasErrors()) {
      throw new Error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    const appBuild = fs.readFileSync(appBuildPath).toString();
    const template = fs.readFileSync(templatePath).toString();

    const replacements = {
      BUILD_APP_SOURCE: `<script type="application/javascript">${appBuild}</script>`,
      BUILD_CSS_SOURCE: '',
    };

    const output = Object.entries(replacements).reduce((str, [k,v]) => str.replace(new RegExp(`<!\-\-\\s*${k}\\s*\-\->`, 'g'), v), template);

    const formatSource = formatOutput({source: output});

    await exec(`mkdir -p ${distPath}`);
    await exec(`mkdir -p ${docsDistPath}`);

    fs.writeFileSync(distJSPath, formatSource);
    fs.writeFileSync(docsDistJsPath, formatSource);

  } finally {
    cleanup();
  }
})()

