const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'files');
const destDir = path.join(__dirname, 'files-copy');

const copyDir = async (srcDir, destDir) => {

  const deleteOldDest = async () => {
    try {
      await fs.promises.rm(destDir, { recursive: true });
    } catch (e) {
      // console.log('all good');
    }
  };

  const createFolder = async () => {
    fs.promises.mkdir(destDir, { recursive: true }, err => {
      if (err) throw err;
      // console.log('New dest folder created');
    });
  };

  const getSrcObjects = async () => {
    const srcDirFiles = await fs.promises.readdir(srcDir, { withFileTypes: true });
    return srcDirFiles;
  };

  const copyObjects = async (srcObjects) => {
    srcObjects.forEach(obj => {
      if (obj.isFile()) {
        const srcFile = path.join(srcDir, obj.name);
        const destFile = path.join(destDir, obj.name);
        fs.promises.copyFile(srcFile, destFile);
      }
      if (!obj.isFile()) {
        const subSrcDir = path.join(srcDir, obj.name);
        const subDestDir = path.join(destDir, obj.name);
        copyDir(subSrcDir, subDestDir);
      }
    });
  };

  await deleteOldDest();
  await createFolder();
  const srcObjects = await getSrcObjects();
  copyObjects(srcObjects);
};

copyDir(srcDir, destDir);

