const ppi = 300;
const inchToMm = 25.4;
const pixelToMm = inchToMm / ppi;

const fileName = "KBPR";



function psInit() {
    preferences.rulerUnits = Units.MM;
    preferences.typeUnits = TypeUnits.MM;
}

function wasteCheck(docWidth, tileSize) {
    var width = Math.floor(docWidth / tileSize.width) * tileSize.width;
    return (docWidth - width) * tileSize.height;
}


function newDocument() {
    $.writeln(selectedPaperSize);
    $.writeln(selectedPaperSize.name);
    $.writeln(selectedPaperSize.width);
    $.writeln(selectedPaperSize.height);
    $.writeln(selectedRollWidth);

    if (!dummyCheck()) return false;

    if (selectedPaperSize == PaperSizes.OTHER || selectedPaperSize == PaperSizes.POSTER || selectedPaperSize == PaperSizes.Sticker) {
        alert("Nem implementált funkció!");
        return false;
    }

    psInit();

    var paperSize = selectedPaperSize;
    var documentWidth = selectedRollWidth; // - 10.4; // TODO: ask Gúz
    var documentHeight = 0;

    // landscape is default, portrait is true
    var roate = false;


    // fits both ways
    if (paperSize.width < documentWidth && paperSize.height < documentWidth) {
        // check which way causes less waste
        var wastePortrait = wasteCheck(documentWidth, paperSize);
        var wasteLandscape = wasteCheck(documentWidth, paperSize);
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
            alert("Nem fér el a kiválasztott méretű papíron!");
            return false;
        }
    }

    var columnWidth = rotate ? paperSize.width : paperSize.height;
    var columnNum = Math.floor(documentWidth / columnWidth);

    var rowNum = Math.ceil(quantity / columnNum);
    var rowHeight = rotate ? paperSize.height : paperSize.width;

    documentHeight = rowNum * rowHeight;

    var correctedQuantity = columnNum * rowNum;


    $.writeln("documentWidth: " + documentWidth);
    $.writeln("documentHeight: " + documentHeight);

    $.writeln("paperSize.width: " + paperSize.width);
    $.writeln("paperSize.height: " + paperSize.height);

    $.writeln("wasteLandscape: " + wasteLandscape);
    $.writeln("wastePortrait: " + wastePortrait);

    $.writeln("rotate: " + rotate);
    $.writeln("columnNum: " + columnNum);
    $.writeln("rowNum: " + rowNum);
    $.writeln("columnWidth: " + columnWidth);
    $.writeln("rowHeight: " + rowHeight);
    $.writeln("correctedQuantity: " + correctedQuantity);



    var newDocument = app.documents.add(documentWidth, documentHeight, ppi, fileName, NewDocumentMode.RGB);

    var mainLayer = copyAsLayer(selectedFile, app.activeDocument, rotate);

    var resizePercent = (columnWidth / mainLayer.bounds[2] - mainLayer.bounds[0]) * 100;
    $.writeln("resizePercent: " + resizePercent);
    $.writeln("bounds: " + mainLayer.bounds);
    
    mainLayer.resize(resizePercent, resizePercent, AnchorPosition.TOPLEFT);

    for (var i = 0; i < correctedQuantity - 1; i++) {
        mainLayer.duplicate(newDocument);
    }

    for (var i = 0; i < rowNum; i++) {
        for (var j = 0; j < columnNum; j++) {
            newDocument.artLayers[i * columnNum + j].translate(j * (columnWidth), i * (rowHeight));
        }
    }

}



function copyAsLayer(file, target, rotate) {
    var doc = app.open(file);

    if (doc.width > doc.height == rotate) {
        doc.rotateCanvas(90);
    }

    var source = app.activeDocument;
    var layer = source.artLayers[0].duplicate(target);
    source.close(SaveOptions.DONOTSAVECHANGES);

    return layer;
}