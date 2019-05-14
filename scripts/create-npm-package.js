const fs = require('fs');
const chalk = require('chalk');

const packageJsonVersion = JSON.parse(fs.readFileSync('./package.json')).version;

const npmPackageDir = `module-imports-order-ts-rule-${packageJsonVersion}`;

const createFolder = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log(chalk.green(`Folder ${dirPath} has been created`));
    return true;
  }
  console.log(chalk.red(`Folder ${dirPath} already exists, no need to create one`));
};

const cloneFile = (filePath, destinationPath) => {
  // if (fs.existsSync(destinationPath)) {
  //   fs.unlinkSync(destinationPath);
  //   console.log(chalk.red(`File ${destinationPath} has been deleted before creating new one`));
  // }
  fs.copyFileSync(filePath, destinationPath);
  console.log(chalk.green(`File from ${filePath} has been copied to ${destinationPath}`));
};

createFolder(npmPackageDir);
console.log(chalk.blue('===================================='));
console.log(chalk.blue('Folders done'));
console.log(chalk.blue(''));
cloneFile('README.md', `${npmPackageDir}/README.md`);
cloneFile('package.json', `${npmPackageDir}/package.json`);
cloneFile('custom-ts-rules/moduleImportsOrderRule.ts', `${npmPackageDir}/moduleImportsOrderRule.ts`);
cloneFile('custom-ts-rules/moduleImportsOrderRule.js', `${npmPackageDir}/moduleImportsOrderRule.js`);
