// import file system
const fileSys = require("fs");
const fileSys2 = require("fs");

// Modify these as needed
const WIDTH = 1000;
const HEIGHT = 1000;
const INPUT_EXT = "png";
const OUTPUT_EXT = "png";
const description = "This is a description";
const baseImageUri = "https://some/url";
const editionStart = 1;
const editionEnd = 10;
const editionSize = 1000;

// removes \\ for / since all systems are ok with / but only windows allows \\
const universalDir = __dirname.replace(/\\/g, '/');
// removes the file extension
const cleanName = (_dirtyName) =>
{
    let search = `.${INPUT_EXT}`;
    let replacer = new RegExp(search, 'g');
    return _dirtyName.replace(replacer, '');
};

// get all files within the given dir and return an object
const getImagesForLayer = (_path) =>
{
    return fileSys
    .readdirSync(_path)
    .filter((_item) => !/(^|\/)\.[^\/\.]/g.test(_item))
    .map((_i, _index) =>
    {
        let imageChoice = 
        {
            imageId: _index + 1,
            imageName: cleanName(_i),
            imageFileName: _i
        };
        return imageChoice;
    });
};

const getConfigValues = (_layerDir) => 
{
    let configFile = `${_layerDir}/config.json`;
    let configObj = {canvasPosition:{x:0,y:0},size:{width:1000,height:1000}};
    if(fileSys.existsSync(configFile))
    {
        configObj = JSON.parse(fileSys.readFileSync(configFile, 'utf8'));
    }
    return configObj;
};

const getAllDirs = (_path) => {
    return fileSys.readdirSync(_path, {withFileTypes: true})
    .filter(dirent => dirent.isDirectory())
    .map((_entry, _index) => {
        let dir = `${universalDir}/${_entry.name}`;
        let configData = getConfigValues(dir);
        let layer = {
            layerId: _index+1,
            layerName: _entry.name,
            layerLocation: `${dir}/`,
            images: getImagesForLayer(`${dir}/`),
            positionOnCanvas: configData.canvasPosition,
            size: configData.size
        };
        return layer;
    });
};

// array of layer objects
//  each layer object consists of information about that layer, including all image choices for that layer
const layers = getAllDirs(__dirname);

module.exports = {
    layers, 
    WIDTH, 
    HEIGHT, 
    OUTPUT_EXT, 
    description, 
    baseImageUri, 
    editionStart,
    editionEnd, 
    editionSize
};
