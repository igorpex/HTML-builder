const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const readdir = (fs.promises.readdir);
const srcDir = __dirname;
const destDir = path.join(__dirname, 'project-dist');

const deleteOldDist = async () => {
  try {
    await fs.promises.rm(destDir, { recursive: true });
  } catch (e) {
    // console.log('all good');
  }
};

const copyDir = async (srcDir, destDir) => {

  const createFolder = async () => {
    await fs.promises.mkdir(destDir, { recursive: true }, err => {
      if (err) throw err;
    });
  };

  const getSrcObjects = async () => {
    const srcDirFiles = await readdir(srcDir, { withFileTypes: true });
    return srcDirFiles;
  };

  // alternate opton to "await fs.promises.copyFile(srcFile, destFile);" (not used)
  const alternateCopy = async (source, target) => {
    // use stream pipe to reduce memory usage
    const writeFileStream = fs.createWriteStream(target);
    const readFileStream = fs.createReadStream(source).pipe(writeFileStream);

    return new Promise(function (resolve, reject) {
      writeFileStream.on('finish', resolve);
      readFileStream.on('error', reject);
    });
  };

  // Basic copy option
  const copyObjects = (srcObjects) => {
    srcObjects.forEach(async (obj) => {
      if (obj.isDirectory()) {
        const subSrcDir = path.join(srcDir, obj.name);
        const subDestDir = path.join(destDir, obj.name);
        await copyDir(subSrcDir, subDestDir);
      }
      if (obj.isFile()) {
        const srcFile = path.join(srcDir, obj.name);
        const destFile = path.join(destDir, obj.name);
        // await alternateCopy(srcFile, destFile);
        await fs.promises.copyFile(srcFile, destFile);
      }
    });
  };

  // Option with directories created first, then copy files
  const copyObjects1 = async (srcObjects) => {
    let directories = srcObjects.filter(obj => obj.isDirectory());
    let files = srcObjects.filter(obj => obj.isFile());

    for (let i = 0; i < directories.length; i++) {
      let obj = await directories[i];
      const subSrcDir = path.join(srcDir, obj.name);
      const subDestDir = path.join(destDir, obj.name);
      await copyDir(subSrcDir, subDestDir);
    }

    for (let i = 0; i < files.length; i++) {
      let obj = await files[i];
      const srcFile = path.join(srcDir, obj.name);
      const destFile = path.join(destDir, obj.name);
      await fs.promises.copyFile(srcFile, destFile);
    }

  };

  await createFolder();
  const srcObjects = await getSrcObjects();
  copyObjects(srcObjects);

};

const mergeStyles = async (stylesSrcDir, destFile) => {

  const getCssFiles = async () => {
    const srcDirFiles = await readdir(stylesSrcDir, { withFileTypes: true });
    const cssFiles = srcDirFiles.filter(dirent => dirent.isFile()).filter(dirent => path.extname(dirent.name) === '.css');
    return cssFiles;
  };

  const copyStyles = async (cssFiles) => {
    const output = fs.createWriteStream(destFile, 'utf-8');
    cssFiles.forEach(file => {
      const cssFilePath = path.join(stylesSrcDir, file.name);
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

  const cssFiles = await getCssFiles();

  await copyStyles(cssFiles);
};


const buildHtmlfromTemplate = async (templatePath, componentsPath, destPath) => {
  let templateContent = await fs.promises.readFile(templatePath, 'utf8');

  const regexp = new RegExp(/{{(.*?)}}/, 'g');
  const matches = templateContent.matchAll(regexp);

  for (let match of matches) {
    const componentName = match[1];

    let componentFilePath = path.join(__dirname, 'components', `${componentName}.html`);
    const componentContent = await fs.promises.readFile(componentFilePath, 'utf8');
    templateContent = templateContent.replace(match[0], componentContent);
  }
  fs.promises.writeFile(destPath, templateContent, 'utf-8');
};


const main = async () => {

  // Delete old Dist folder 
  await deleteOldDist();

  // Copy assets
  const assetsSrcDir = path.join(srcDir, 'assets');
  const assetsDestDir = path.join(destDir, 'assets');
  await copyDir(assetsSrcDir, assetsDestDir);

  // Merge styles
  const stylesSrcDir = path.join(__dirname, 'styles');
  // const stylesDestDir = path.join(__dirname, 'project-dist');
  const destFile = path.join(destDir, 'style.css');
  await mergeStyles(stylesSrcDir, destFile);

  // Inlcude html blocks to main html
  const templatePath = path.join(__dirname, 'template.html');
  const destPath = path.join(__dirname, 'project-dist', 'index.html');
  const componentsPath = path.join(__dirname, 'components');
  await buildHtmlfromTemplate(templatePath, componentsPath, destPath);
};

main();
