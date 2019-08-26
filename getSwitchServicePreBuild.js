const fs = require('fs');
const download = require('download');
const rimraf = require("rimraf");

console.log('[info]: Getting Switch service prebuild binary...');
console.log(`[info]: ${process.platform} detected`);
const getVersionArg = process.argv[2];
const fileName = `switch_deamon_v${getVersionArg}_${process.platform}_release.zip`;
if(fs.existsSync('./service-binaries/'))
{
    console.log('[info]: Clearing binaries cache...');
    rimraf.sync('./service-binaries/');
    console.log('[info]: Cache binaries cleared!');
}

const url = `https://github.com/ahkohd/switch/releases/download/switch-v${getVersionArg}/${fileName}`;


console.log('[info]: Downloading prebuild..');
console.log('[url]:', url);

download(url, './service-binaries', {extract: true, filter: file => !file.path.endsWith('/')}).then(() => {
    console.log('[info]: Prebuild downloaded!');
    console.log('[info]: Prebuild extracted!');
    console.log('[success]: Done!');
}).catch(err =>{
    console.log('[error]: Unable to download prebuild');
    throw err;
});