const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'secret-folder');

async function start() {
  try {
    const list = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const files = list.filter(dirent => dirent.isFile());
    for (let file of files) {
      const fileName = file['name'];
      // const fileBaseName = path.basename(fileName, path.extname(fileName));
      const fileBaseName = path.parse(fileName).name;
      // const fileExt = path.parse(fileName).ext; //.csv
      const ext = path.extname(fileName).slice(1);
      const filePath = path.join(__dirname, 'secret-folder', fileName);
      fs.stat(filePath, (err, stats) => {
        console.log(fileBaseName, '-', ext, '-', (stats.size / 1024).toFixed(3) + 'kb');
      });
    }
  } catch (err) {
    console.error(err);
  }
}

start();
