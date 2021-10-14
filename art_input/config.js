// import file system
const fileSys = require("fs");

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

// TODO made the art input dir pass-in-able
// array of layer objects
//  each layer object consists of information about that layer, including all image choices for that layer
const layers = [
    {
        layerId: 1,
        layerName: "background",
        layerLocation: `${universalDir}/background/`,
        images: getImagesForLayer(`${universalDir}/background/`),
        positionOnCanvas: {x:0, y:0},
        size: {width:WIDTH, height:HEIGHT}
    },
    {
        layerId: 2,
        layerName: "catgirl",
        layerLocation: `${universalDir}/catgirl/`,
        images: getImagesForLayer(`${universalDir}/catgirl/`),
        positionOnCanvas: {x:0, y:0},
        size: {width:WIDTH, height:HEIGHT}
    },
    {
        layerId: 3,
        layerName: "heart",
        layerLocation: `${universalDir}/heart/`,
        images: getImagesForLayer(`${universalDir}/heart/`),
        positionOnCanvas: {x:0, y:0},
        size: {width:WIDTH, height:HEIGHT}
    },
    {
        // TODO: remove layerId and layerName perhaps
        layerId: 4,
        layerName: "speech_bubble",
        layerLocation: `${universalDir}/speech_bubble/`,
        images: getImagesForLayer(`${universalDir}/speech_bubble/`),
        positionOnCanvas: {x:0, y:0},
        size: {width:WIDTH, height:HEIGHT}
    },
    // {
    //     layerId: 5,
    //     layerName: "cat_peeking",
    //     layerLocation: `${universalDir}/cat_peeking/`,
    //     images: getImagesForLayer(`${universalDir}/cat_peeking/`),
    //     positionOnCanvas: {x:0, y:0},
    //     size: {width:WIDTH, height:HEIGHT}
    // }
];

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