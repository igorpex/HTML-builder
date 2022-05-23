const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');

const srcDir = path.join(__dirname, 'styles');
const destDir = path.join(__dirname, 'project-dist');
const destFile = path.join(destDir, 'bundle.css');
// const { stdout } = process;

const mergeStyles = async () => {

  const getCssFiles = async () => {
    const srcDirFiles = await fs.promises.readdir(srcDir, { withFileTypes: true });
    const cssFiles = srcDirFiles.filter(dirent => dirent.isFile()).filter(dirent => path.extname(dirent.name) === '.css');
    return cssFiles;
  };

  // const showCssFiles = async (srcObjects) => {
  //   console.log('CSS files to merge:');
  //   srcObjects.forEach(obj => {
  //     console.log(obj.name);
  //   });
  // };

  const copyStyles = async (cssFiles) => {
    const output = fs.createWriteStream(destFile, 'utf-8');
    output.setMaxListeners(20);
    cssFiles.forEach(file => {
      const cssFilePath = path.join(srcDir, file.name);
      const input = fs.createReadStream(cssFilePath, 'utf-8');
      pipeline(
        input,
        output,
        err => {
          if (err) {
            console.log('Pipeline error: ', err);
          }
        }
      );
    });
  };

  const cleanOldBundle = async () => {
    try {
      // stdout.write('Cleaning old bundle if required: ');
      await fs.promises.rm(destFile, { recursive: true });
      // stdout.write('old bundle deleted\n');
    } catch (e) {
      // stdout.write('there is no old bundle to delete\n');
    }
  };

  await cleanOldBundle();
  const cssFiles = await getCssFiles();
  // showCssFiles(cssFiles);
  copyStyles(cssFiles);
};

mergeStyles();