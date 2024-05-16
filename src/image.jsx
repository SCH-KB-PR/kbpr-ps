// image constants
const ppi = 300;
const inchToMm = 25.4;
const mmToPixel = ppi / inchToMm;
const mmToPoint = mmToPixel * 72 / ppi; // at 72 ppi 1px = 1pt

preferences.rulerUnits = Units.MM;
preferences.typeUnits = TypeUnits.MM;

// convert mm to pt
function mmToPt(mm) {
    return mm * mmToPoint;
}


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
var wasteMargin;
var rotate;
var columnNum, rowNum;
var columnWidth, rowHeight;
var correctedQuantity;
function preCalcGrid() {
    var paperSize = selectedPaperSize;
    // apply margin on both sides
    documentWidth = selectedRollWidth - margin * 2;

    // fits both ways
    if (paperSize.width <= documentWidth && paperSize.height <= documentWidth) {
        // check which way causes less waste
        var wastePortrait = wasteCheck(documentWidth, paperSize, gutter);
        var wasteLandscape = wasteCheck(documentWidth, { width: paperSize.height, height: paperSize.width }, gutter);
        rotate = wasteLandscape < wastePortrait;
    }
    else {
        // only landscape fits
        if (paperSize.width <= documentWidth) {
            rotate = false;
        }
        // only portrait fits
        else if (paperSize.height <= documentWidth) {
            rotate = true;
        }
        // neither fits
        else {
            preCalcInfoKeys.text = "Nem fér el!";
            preCalcInfoValues.text = "";
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
    documentHeight = rowNum * (rowHeight + gutter) - gutter;

    // calculate the corrected quantity
    correctedQuantity = columnNum * rowNum;

    // calculate the initial gap on the side
    wasteMargin = (documentWidth - (columnNum * (columnWidth + gutter) - gutter)) / 2;


    // update ui
    correctedQuantityText.text = correctedQuantity + " db";
    preCalcInfoKeys.text =
        "Forgatás:\n" +
        "Rács:\n" +
        "Rácsméret:\n" +
        "Dokumentum:";
    preCalcInfoValues.text =
        (rotate ? "Igen" : "Nem") + "\n" +
        columnNum + " \u00D7 " + rowNum + " db\n" +
        Math.round(columnWidth) + " \u00D7 " + Math.round(rowHeight) + " mm\n" +
        Math.round(documentWidth) + " \u00D7 " + Math.round(documentHeight) + " mm";

    // this is a terrible way of doing this

    return true;
}


// creates the canvas and places the images
// returns true if the operation was successful
function createImage() {
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
    var doc = app.documents.add(documentWidth, documentHeight, ppi, fileName, NewDocumentMode.RGB);

    // open the file
    var mainLayer = openAsLayer(selectedFile, doc, rotate);
    mainLayer.name = "Image";

    // resize the layer
    var resizeWidthPercent = (columnWidth / mainLayer.bounds[2] - mainLayer.bounds[0]) * 100;
    var resizeHeightPercent = (rowHeight / mainLayer.bounds[3] - mainLayer.bounds[1]) * 100;
    mainLayer.resize(resizeWidthPercent, resizeHeightPercent, AnchorPosition.TOPLEFT);

    // apply mask if needed
    if (circleMask) {
        createCircleMask(doc, mainLayer);
    }

    // duplicate the layer to match quanity
    for (var i = 0; i < finalQuantity - 1; i++) {
        mainLayer.duplicate(doc);
    }

    // arrange the layers
    var counter = 0;
    for (var i = 0; i < rowNum; i++) {
        for (var j = 0; j < columnNum; j++) {
            doc.artLayers[i * columnNum + j].translate(wasteMargin + j * (columnWidth + gutter), i * (rowHeight + gutter));
            if (++counter >= finalQuantity) break; // if we are not filling the final row
        }
    }

    if (guide) {
        createGuides(doc)
    }

    return true;
}

// creates a circle mask on the given layer
function createCircleMask(doc, mainLayer) {
    // open the mask
    var maskLayer = openAsLayer(File(scriptPath + "misc/circleStickerMask.png"), doc);
    maskLayer.name = "Mask";

    // resize the mask
    var maskResizeWidthPercent = (columnWidth / maskLayer.bounds[2] - maskLayer.bounds[0]) * 100;
    var maskResizeHeightPercent = (rowHeight / maskLayer.bounds[3] - maskLayer.bounds[1]) * 100;
    maskLayer.resize(maskResizeWidthPercent, maskResizeHeightPercent, AnchorPosition.TOPLEFT);

    // select the mask
    doc.selection.load(doc.channels.getByName("Red"), SelectionType.REPLACE); // since its a mask any channel works

    // apply the mask to the main layer
    doc.activeLayer = mainLayer;
    doc.selection.clear();
    doc.selection.deselect();

    // remove mask layer
    maskLayer.remove();
}

// creates the guides on the borders of the tiles
function createGuides(doc) {
    // new layer at the top
    var guideLayer = doc.artLayers.add();
    guideLayer.name = "Guides";
    guideLayer.move(doc, ElementPlacement.PLACEATBEGINNING);
    doc.activeLayer = guideLayer;

    // set color
    app.foregroundColor.rgb.red = 0;
    app.foregroundColor.rgb.green = 0;
    app.foregroundColor.rgb.blue = 0;
    // TODO: !!! we have to manually set the pencil size to 1px !!!

    // we have to convert the units to points
    var documentWidthPt = mmToPt(documentWidth);
    var documentHeightPt = mmToPt(documentHeight);
    var wasteMarginPt = mmToPt(wasteMargin);
    var columnWidthPt = mmToPt(columnWidth);
    var rowHeightPt = mmToPt(rowHeight);
    var gutterPt = mmToPt(gutter);

    lines = new Array();

    // vertical lines
    for (var i = 0; i < columnNum; i++) {
        var pre = wasteMarginPt + i * (columnWidthPt + gutterPt);
        var post = pre + columnWidthPt;
        lines.push(createLineSubPath([pre, 0], [pre, documentHeightPt]));
        lines.push(createLineSubPath([post, 0], [post, documentHeightPt]));
    }

    // horizontal lines
    for (var i = 0; i < rowNum; i++) {
        var pre = i * (rowHeightPt + gutterPt);
        var post = pre + rowHeightPt;
        lines.push(createLineSubPath([0, pre], [documentWidthPt, pre]));
        lines.push(createLineSubPath([0, post], [documentWidthPt, post]));
    }

    // rasterize the path
    var path = doc.pathItems.add("Line", lines);
    path.strokePath(ToolType.PENCIL);
    path.remove();
}

// creates a line subpath from c1 to c2
function createLineSubPath(c1, c2) {
    var p1 = new PathPointInfo();
    p1.anchor = p1.leftDirection = p1.rightDirection = c1;

    var p2 = new PathPointInfo();
    p2.anchor = p2.leftDirection = p2.rightDirection = c2;

    p1.kind = p2.kind = PointKind.CORNERPOINT;

    var spi = new SubPathInfo();
    spi.closed = false;
    spi.operation = ShapeOperation.SHAPEADD;
    spi.entireSubPath = [p1, p2];

    return spi;
}


// opens the file as a layer to the target document
function openAsLayer(file, target, rotate) {
    if (rotate == undefined) rotate = false;

    var doc = app.open(file);

    if (rotate != doc.width > doc.height) {
        doc.rotateCanvas(90);
    }

    var source = app.activeDocument;
    var layer = source.artLayers[0].duplicate(target);
    source.close(SaveOptions.DONOTSAVECHANGES);

    return layer;
}