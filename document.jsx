const ppi = 300;
const inchToMm = 25.4;
const pixelToMm = inchToMm / ppi;





function psInit() {
    preferences.rulerUnits = Units.MM;
    preferences.typeUnits = TypeUnits.MM;
}

function wasteCheck(docWidth, tileWidth, gutter) {
    width = tileWidth;
    while (width + tileWidth + gutter < docWidth) {
        width += tileWidth + gutter;
    }
    return docWidth - width;
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
    var documentWidth = selectedRollWidth - 10.4; // TODO: ask Gúz
    var documentHeight = 0;
    
    var roate = false;

    
    if (paperSize.width < documentWidth) {
        
    }
    else if (paperSize.height < documentWidth) {
        
    }
    else {
        alert("Nem fér el a kiválasztott méretű papíron!");
        return false;
    }



}