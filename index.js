// TODO fix all the {} formatting heh....and add parameter definitions

/* IMPORTS */ 
// Import file system
const fs = require("fs");
// Import CreateCanvas and LoadImage from ^canvas
const { createCanvas, loadImage } = require("canvas");
// Import config.js
const {    
    layers, 
    WIDTH, 
    HEIGHT, 
    OUTPUT_EXT, 
    description, 
    baseImageUri, 
    editionStart,
    editionEnd, 
    editionSize
} = require("./art_input/config.js");

// Metadata
// TODO rename the metadata to what it actually represents...
var metadataList = [];
var attributesList = [];

// DNA, TODO name this better
var dnaList = [];

// Create the canvas
const canvas = createCanvas(1000,1000);
// canvas context (what you actually draw onto)
const ctx = canvas.getContext("2d");

const isDnaUnique = (_dnaList = [], _newDna = []) =>
{
    return _dnaList.find((_existingDna) => _existingDna.join("") === _newDna.join("")) == undefined;
};

// create a string of length 2 * layers.length
const createDna = (_layers) =>
{
    // Need 1 less digit for digitCount because Ne will have N as a single digit 
    //let digitCount = (_length * 2) - 1;
    //let randNum = Math.floor(Number(`1e${digitCount}`) + Math.random() * Number(`9e${digitCount}`));
    let randNum = [];
    _layers.forEach((_layer) => {
        let num = Math.floor(Math.random() * _layer.images.length);
        randNum.push(num);
    });
    return randNum;
};

const addMetadata = (_dna, _editionCount) =>
{
    let dateTime = Date.now();
    let tempMetadata = 
    {
        dna: _dna.join(""),
        edition: _editionCount,
        date: dateTime,
        attributes: attributesList
    };
    metadataList.push(tempMetadata);
    // cleanup
    // TODO: I can do this better without globals -_-
    attributesList = [];
};

const addAttributes = (_image, _layer) =>
{
    let selectedImage = _image.selectedImage;
    attributesList.push({
        name: selectedImage.imageName
    });
};

const saveImage = (_editionCount) =>
{
    // write the file
    fs.writeFileSync(`./output/${_editionCount}.${OUTPUT_EXT}`, canvas.toBuffer(`image/${OUTPUT_EXT}`));
};

// Draw the image on the canvas

// async Function to draw image on canvas
const loadLayerImage = async (_layer) =>
{
    return new Promise(async(resolve, reject) => 
    {
        const image = await loadImage(`${_layer.layerLocation}${_layer.selectedImage.imageFileName}`);
        // TODO This is the data type used for drawImage() make it better?
        // holy moley JS is gross
        return resolve({layer: _layer, loadedImage: image});
        // TODO handle reject?
    });
};

const drawImage = (_image) =>
{
    ctx.drawImage(
        _image.loadedImage, 
        _image.layer.positionOnCanvas.x, 
        _image.layer.positionOnCanvas.y, 
        _image.layer.size.width, 
        _image.layer.size.height
    );

    // add to metadata
    addAttributes(_image.layer);
};

const constructLayerDataFromDna = (_dna = [], _layers = []) =>
{
    let mappedDnaToLayers = _layers.map((_layer, index) => { 
        let selectedImage = _layer.images[_dna[index]];
        return {
            layerLocation: _layer.layerLocation,
            positionOnCanvas: _layer.positionOnCanvas,
            size: _layer.size,
            selectedImage: selectedImage
        };
    });
    return mappedDnaToLayers;
};

// how many images to create per run
// retrieved from input args
const parseArgs = () =>
{
    let args = process.argv.slice(2);
    return args.length > 0 ? Number(args[0]) : 1;
};

const writeMetadata = (_dataToWrite) =>
{
    fs.readFile("./output/_metadata.json", (err, data) => 
    {
        if(err)
        {
            throw err;
        }
        fs.writeFileSync("./output/_metadata.json", _dataToWrite);
    });
};

// if wanted we can generate background colors
const drawPastelColor = () =>
{
    let hue = Math.floor(Math.random() * 360);
    let pastel = `hsl(${hue}, 100%, 85%)`;
    return pastel;
};

// draw a black background on the entire image
const drawBackgroundColor = () =>
{
    ctx.fillStyle = drawPastelColor();
    ctx.fillRect(0,0, WIDTH, HEIGHT);
};

const signImage = (_signature) =>
{
    // black color
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30pt Courier";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(_signature, 40, 40);
};

const createEditions = async (_numEditionsToCreate) =>
{
    // clears the old metadata file
    // TODO: probably create backup copies
    writeMetadata("");

    // In a perfect world we should only run _numEditionsToCreate
    let failsafe = _numEditionsToCreate * 100;

    let editionCnt = 1;
    while(editionCnt <= _numEditionsToCreate)
    {
        // Try to generate a new unique DNA
        // TODO newDna is a list now instead of a string
        let newDna = createDna(layers);
        console.log(`Testing ${newDna} for uniqueness`);
        if(isDnaUnique(dnaList, newDna))
        {
            // Generate all the layers for a given edition
            let layersThisEdition = constructLayerDataFromDna(newDna, layers);
            let asyncTasks = {
                tasks: [],
                edition: editionCnt
            };
            // Create an async task for each layer image to load
            layersThisEdition.forEach((_layer) => 
            {
                asyncTasks.tasks.push(loadLayerImage(_layer));
            });
            asyncTasks.edition = editionCnt;

            // await all the tasks
            // TODO awaiting this means we don't need to pass in the edition into async data
            // TODO also might be faster? not sure
            await Promise.all(asyncTasks.tasks).then(_layerImageData => {
                // clearing the screen for cleanliness
                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                // uncomment if generated background color
                //drawBackgroundColor();
                _layerImageData.forEach(_image => {
                    drawImage(_image);
                });

                // sign the image
                signImage(`#${editionCnt}`);

                // finally save the image file
                saveImage(asyncTasks.edition);
                addMetadata(newDna, asyncTasks.edition);
                console.log(`Creating Edition ${asyncTasks.edition} with DNA [${newDna}]`);
            });

            // push regardless of promise
            dnaList.push(newDna);
            ++editionCnt;
        }
        else
        {
            console.log(`Skipping non-Unique DNA [${newDna}]`);
        }

        // Infinite looping failsafe check
        --failsafe;
        if(failsafe <= 0)
        {
            console.log(`ERROR! Infinite looping occurred during DNA creation process.\nSuccessfully created ${editionCnt-1} editions`);
            break;
        }
    }
    // write metadata
    writeMetadata(JSON.stringify(metadataList));
};

createEditions(parseArgs());