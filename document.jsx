const ppi = 300;
const inchToMm = 25.4;
const pixelToMm = inchToMm / ppi;

const fileName = "KBPR";

preferences.rulerUnits = Units.MM;
preferences.typeUnits = TypeUnits.MM;


function wasteCheck(docWidth, tileSize) {
    var width = Math.floor(docWidth / tileSize.width) * tileSize.width;
    return (docWidth - width) * tileSize.height;
}

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


var documentWidth, documentHeight;
var rotate;
var columnNum, rowNum;
var columnWidth, rowHeight;
var correctedQuantity;
function preCalcGrid() {
    var paperSize = selectedPaperSize;
    documentWidth = selectedRollWidth; // - 10.4; // TODO: ask Gúz

    // fits both ways
    if (paperSize.width < documentWidth && paperSize.height < documentWidth) {
        // check which way causes less waste
        var wastePortrait = wasteCheck(documentWidth, paperSize);
        var wasteLandscape = wasteCheck(documentWidth, { width: paperSize.height, height: paperSize.width });
        rotate = wasteLandscape < wastePortrait;
    }
    else {
        if (paperSize.width < documentWidth) {
            // only landscape fits
            rotate = false;
        }
        else if (paperSize.height < documentWidth) {
            // only portrait fits
            rotate = true;
        }
        else {
            // neither fits
            return false;
        }
    }

    columnWidth = rotate ? paperSize.height : paperSize.width;
    columnNum = Math.floor(documentWidth / columnWidth);

    rowNum = Math.ceil(quantity / columnNum);
    rowHeight = rotate ? paperSize.width : paperSize.height;

    documentHeight = rowNum * rowHeight;
    correctedQuantity = columnNum * rowNum;


    // update ui
    correctedQuantityText.text = correctedQuantity + " db";

    return true;
}

function newDocument() {
    if (!dummyCheck()) return false;
    if (!preCalcGrid()) {
        alert("Nem fér el a kiválasztott méretű papíron!");
        return false;
    }

    var newDocument = app.documents.add(documentWidth, documentHeight, ppi, fileName, NewDocumentMode.RGB);

    var mainLayer = copyAsLayer(selectedFile, app.activeDocument, rotate);

    var resizePercent = (columnWidth / mainLayer.bounds[2] - mainLayer.bounds[0]) * 100;
    $.writeln("resizePercent: " + resizePercent);
    $.writeln("bounds: " + mainLayer.bounds);
    
    mainLayer.resize(resizePercent, resizePercent, AnchorPosition.TOPLEFT);

    var finalQuantity = quantityCorrectionEnabled ? correctedQuantity : quantity;

    for (var i = 0; i < finalQuantity - 1; i++) {
        mainLayer.duplicate(newDocument);
    }

    var counter = 0;
    for (var i = 0; i < finalQuantity; i++) {
        for (var j = 0; j < columnNum; j++) {
            newDocument.artLayers[i * columnNum + j].translate(j * columnWidth, i * rowHeight);
            if (++counter >= quantity) break;
        }
    }

    return true;
}



function copyAsLayer(file, target, rotate) {
    var doc = app.open(file);

    if (rotate != doc.width > doc.height) {
        doc.rotateCanvas(90);
    }

    var source = app.activeDocument;
    var layer = source.artLayers[0].duplicate(target);
    source.close(SaveOptions.DONOTSAVECHANGES);

    return layer;
}