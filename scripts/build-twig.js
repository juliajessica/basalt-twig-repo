#! /usr/bin/env node
const TwigRenderer = require('@basalt/twig-renderer');
const { join, parse, relative } = require('path');
const { readdir, ensureDirSync, writeFileSync } = require('fs-extra');

const rootDir = join(__dirname, '../src');

const twigRenderer = new TwigRenderer({
  src: {
    roots: [rootDir],
  },
});

const pagesDir = join(__dirname, '../src/pages');
const distDir = join(__dirname, '../dist');
ensureDirSync(distDir);

readdir(pagesDir).then(files => {
  files
    .filter(file => file.endsWith('.twig'))
    .map(file => join(pagesDir, file))
    .map(page => {
      let data = {};
      try {
        data = require(page.replace('.twig', ''));
      } catch (err) {} // eslint-disable-line no-empty

      const { name } = parse(page);
      const distPath = join(distDir, `${name}.html`);
      const templatePath = relative(rootDir, page);
      // console.log({ data, name, distPath });
      return twigRenderer
        .render(templatePath, data)
        .then(({ ok, message, html }) => {
          // console.log({ data, name, distPath, ok, message, html });
          if (!ok) {
            console.log(`Uh oh! Error rendering "${templatePath}"`);
            console.log(message);
            console.log();
            process.exit(1);
          }
          try {
            writeFileSync(distPath, html);
          } catch (err) {
            console.log(`Uh oh! Error writing "${distPath}"`);
            console.log(err);
            process.exit(1);
          }
          return true;
        });
    });
});
