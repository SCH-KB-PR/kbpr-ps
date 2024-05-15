const ppi = 300;
// TODO: redundant
const inchToMm = 25.4;
const pixelToMm = inchToMm / ppi;

const fileName = "KBPR";

preferences.rulerUnits = Units.MM;
preferences.typeUnits = TypeUnits.MM;


// calculates the number of columns that can fit the document width
function columnNumCalc(docWidth, tileSize, gutter) {
    // theres always one less gutter than tile, they are only inbetween tiles
    return Math.floor((docWidth + gutter) / (tileSize.width + gutter));
}

// calculates the wasted area of the documents side
// TODO: take gutters into consideration
function wasteCheck(docWidth, tileSize, gutter) {
    var columns = columnNumCalc(docWidth, tileSize, gutter);
    var width = columns * (tileSize.width + gutter) - gutter;

    // waste as an area instead of just width
    return (docWidth - width) * tileSize.height;
}

// check if the user had selected a file or a folder
function dummyCheck() {
    if (selectedMode == FileModes.FILE && selectedFile == null) {
        alert("Nem választottál ki fájlt!");
        return false;
    }
    if (selectedMode == FileModes.FOLDER && selectedFolder == null) {
        alert("Nem választottál ki mappát!");
        return false;
    }
    return true;
}


// recalculate the grid parameters if a setting has changed to preview the result
// returns true if it fits
var documentWidth, documentHeight;
var rotate;
var columnNum, rowNum;
var columnWidth, rowHeight;
var correctedQuantity;
function preCalcGrid() {
    var paperSize = selectedPaperSize;
    // apply margin on both sides
    documentWidth = selectedRollWidth - margin * 2; // - 10.4; // TODO: ask Gúz

    // fits both ways
    if (paperSize.width < documentWidth && paperSize.height < documentWidth) {
        // check which way causes less waste
        var wastePortrait = wasteCheck(documentWidth, paperSize, gutter);
        var wasteLandscape = wasteCheck(documentWidth, { width: paperSize.height, height: paperSize.width }, gutter);
        rotate = wasteLandscape < wastePortrait;
    }
    else {
        // only landscape fits
        if (paperSize.width < documentWidth) {
            rotate = false;
        }
        // only portrait fits
        else if (paperSize.height < documentWidth) {
            rotate = true;
        }
        // neither fits
        else {
            return false;
        }
    }

    // dimensions of the tiles
    // TODO: cleanup 
    columnWidth = rotate ? paperSize.height : paperSize.width;
    rowHeight = rotate ? paperSize.width : paperSize.height;

    // number of columns and rows
    columnNum = columnNumCalc(documentWidth, { width: columnWidth, height: rowHeight }, gutter);
    rowNum = Math.ceil(quantity / columnNum);

    // total document height
    // TODO: do we need margin at the top and bottom?
    documentHeight = rowNum * (rowHeight + gutter) - gutter;

    // calculate the corrected quantity
    correctedQuantity = columnNum * rowNum;


    // update ui
    correctedQuantityText.text = correctedQuantity + " db";
    // TODO: show more info in a panel

    return true;
}


// creates the canvas and places the images
// returns true if the operation was successful
function create() {
    // checks
    if (selectedMode == FileModes.FOLDER) {
        alert("Nem implementált funkció!")
    }

    if (!dummyCheck()) return false;

    if (!preCalcGrid()) {
        alert("Nem fér el a kiválasztott méretű papíron!");
        return false;
    }

    // finalize quanitity
    const finalQuantity = quantityCorrectionEnabled ? correctedQuantity : quantity;

    // create canvas in ps
    var newDocument = app.documents.add(documentWidth, documentHeight, ppi, fileName, NewDocumentMode.RGB);

    // open the file
    var mainLayer = openAsLayer(selectedFile, app.activeDocument, rotate);

    // resize the layer
    var resizePercent = (columnWidth / mainLayer.bounds[2] - mainLayer.bounds[0]) * 100;
    mainLayer.resize(resizePercent, resizePercent, AnchorPosition.TOPLEFT);

    // duplicate the layer to match quanity
    for (var i = 0; i < finalQuantity - 1; i++) {
        mainLayer.duplicate(newDocument);
    }

    // arrange the layers
    var counter = 0;
    for (var i = 0; i < rowNum; i++) {
        for (var j = 0; j < columnNum; j++) {
            newDocument.artLayers[i * columnNum + j].translate(j * (columnWidth + gutter), i * (rowHeight + gutter));
            if (++counter >= finalQuantity) break;
        }
    }

    // TODO: merge the two fors

    return true;
}


// opens the file as a layer to the target document
function openAsLayer(file, target, rotate) {
    var doc = app.open(file);

    if (rotate != doc.width > doc.height) {
        doc.rotateCanvas(90);
    }

    var source = app.activeDocument;
    var layer = source.artLayers[0].duplicate(target);
    source.close(SaveOptions.DONOTSAVECHANGES);

    return layer;
}