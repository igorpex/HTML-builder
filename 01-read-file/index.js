const fs = require('fs');
const path = require('path');

const { stdout } = process;
const file = path.join(__dirname, 'text.txt');
const stream = fs.createReadStream(file, 'utf-8');

stream.on('data', chunk => stdout.write(chunk));
stream.on('end', () => process.exit());

// solution 2
// let data = '';
// stream.on('data', chunk => data += chunk);
// stream.on('end', () => { console.log(data); process.exit() });
// stream.on('error', error => console.log('Error: ', error.message));

