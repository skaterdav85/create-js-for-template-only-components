#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const APP_PATH = path.join(__dirname, 'app');
const TEMPLATE_EXTENSION = process.env.TEMPLATE_EXTENSION || '.hbs';

const directoryPath = path.join(APP_PATH, 'templates/components/');
const templatesWithMissingJsFile = [];

listFiles(directoryPath);

function listFiles(directoryPath) {
  const list = fs.readdirSync(directoryPath);
  
  list.forEach((item) => {  
    const itemPath = path.join(directoryPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      listFiles(itemPath);
    } else {
      const jsFile = itemPath
        .replace('app/templates/', 'app/')
        .replace(TEMPLATE_EXTENSION, '.js');

      if (!fs.existsSync(jsFile)) {
        templatesWithMissingJsFile.push(itemPath);
      }
    }
  });
}

console.log(`Potential conflicts: ${templatesWithMissingJsFile.length}`);

templatesWithMissingJsFile.forEach((itemPath) => {
  const componentName = getComponentNameFromPath(itemPath);
  console.warn(`A .js file does not exist for ${componentName}`);
  execSync(`ember g component-class ${componentName}`);
});

function getComponentNameFromPath(path) {
  return path
    .replace(TEMPLATE_EXTENSION, '')
    .replace(/^.+components\//, '');
}