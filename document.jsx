const ppi = 300;
const inchToMm = 25.4;
const pixelToMm = inchToMm / ppi;


function newDocument() {
    if (!dummyCheck()) return false;
    
    $.writeln(selectedPaperSize);
    $.writeln(selectedPaperSize.name);
    $.writeln(selectedPaperSize.width);
    $.writeln(selectedPaperSize.height);
}