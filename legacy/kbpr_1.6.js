#target 'photoshop'

var propertyWidth = 130;
var dataWidth = 100;
var unitWidth = 70;
var height = 22;

var paperWidth = 0;
var otherWidth = 0;
var otherHeight = 0;
var paperSize;
var fileName = "Untitled";
var quantity = 0;
var multiplier = 1;
var filePath = null;
var folderPath = null;
var folderFiles = null;
var borderNeeded = false;
var isManyFile = false;
var checkBorderNeeded;
var checkIsManyFile;
var fileField;
var quantityGroup;
var otherPaperWidthSizeGroup;
var otherPaperHeightSizeGroup;
var totalQuantity = 0;

var MainWindow = new Window('dialog', 'KBPR script', undefined, { closeButton: true }); {
  var InputGroup = MainWindow.add("group"); {
    InputGroup.orientation = "column";
    InputGroup.alignChildren = "left";
    fileField = InputGroup.add("group"); {
      fileField.add("statictext", [0, 0, propertyWidth, height], "Fájl:");
      var filePathText = fileField.add("statictext", [0, 0, 200, height]);
      var browseButton = fileField.add('button', [0, 0, unitWidth, height], 'Keresés');
      browseButton.onClick = function () {
        if(isManyFile){
          folderPath = Folder.selectDialog("Selection prompt");
          if (folderPath != null) {
            fileName = folderPath.name;
            filePathText.text = folderPath.name;
          }
          folderFiles = folderPath.getFiles();
          quantity = Number(folderFiles.length);
          quantityGroup.children[1].text = multiplier;
        }
        else{
          filePath = File.openDialog("Selection prompt");
          if (filePath != null) {
            fileName = filePath.name;
            filePathText.text = filePath.name;
          }
        }
      }
    }
    var manyFileGroup = InputGroup.add("group"); {
      manyFileGroup.alignChildren = "left";
      manyFileGroup.add("statictext", [0, 0, propertyWidth, height], "Több különböző fájl:");
      checkIsManyFile = manyFileGroup.add("checkbox", [0, 0, dataWidth, height]);
      isManyFile = checkIsManyFile.value;
    }
    var paperWidthGroup = InputGroup.add("group"); {
      paperWidthGroup.add("statictext", [0, 0, propertyWidth, height], "Papírhenger szélesség:");
      paperWidth = paperWidthGroup.add("dropdownlist", [0, 0, dataWidth, height], ["610", "914", "1067"]);
      paperWidth.selection = 1;
      paperWidthGroup.add("statictext", [0, 0, unitWidth, height], "mm");
    }
    var paperSizeGroup = InputGroup.add("group"); {
      paperSizeGroup.add("statictext", [0, 0, propertyWidth, height], "Papírméret:");
      paperSize = paperSizeGroup.add("dropdownlist", [0, 0, dataWidth, height], ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "Nagyplakát", "Körmatrica", "Egyéb"]);
      paperSize.selection = 4;
      paperSizeGroup.add("statictext", [0, 0, unitWidth, height], "");
    }
    quantityGroup = InputGroup.add("group"); {
      quantityGroup.alignChildren = "left";
      quantityGroup.add("statictext", [0, 0, propertyWidth, height], "Mennyiség:");
      quantityText = quantityGroup.add("edittext", [0, 0, dataWidth, height], "20");
      if(isManyFile){
        multiplier = Number(quantityText.text);
      }
      else{
        quantity = Number(quantityText.text);
      }
      
      quantityGroup.add("statictext", [0, 0, unitWidth, height], "db");
    }
    var borderGroup = InputGroup.add("group"); {
      borderGroup.alignChildren = "left";
      borderGroup.add("statictext", [0, 0, propertyWidth, height], "Segítő határ:");
      checkBorderNeeded = borderGroup.add("checkbox", [0, 0, dataWidth, height]);
      borderNeeded = checkBorderNeeded.value;
    }
    otherPaperWidthSizeGroup = InputGroup.add("group"); {
      otherPaperWidthSizeGroup.add("statictext", [0, 0, propertyWidth, height], "Rövidebbik oldal:");
      paperWidthSizeText = otherPaperWidthSizeGroup.add("edittext", [0, 0, dataWidth, height], "210.14");
      otherWidth = Number(parseFloat(paperWidthSizeText.text.replace(',', '.')));
      otherPaperWidthSizeGroup.add("statictext", [0, 0, unitWidth, height], "mm");
    }
    otherPaperHeightSizeGroup = InputGroup.add("group"); {
      otherPaperHeightSizeGroup.add("statictext", [0, 0, propertyWidth, height], "Hosszabbik oldal:");
      paperHeightSizeText = otherPaperHeightSizeGroup.add("edittext", [0, 0, dataWidth, height], "297.26");
      otherHeight = Number(parseFloat(paperHeightSizeText.text.replace(',', '.')));
      otherPaperHeightSizeGroup.add("statictext", [0, 0, unitWidth, height], "mm");
    }
    otherPaperWidthSizeGroup.hide();
    otherPaperHeightSizeGroup.hide();

    quantityText.onChanging = function () {
      if(isManyFile){
        multiplier = Number(quantityText.text);
      }
      else{
        quantity = Number(quantityText.text);
      }
     
    }

    paperWidthSizeText.onChanging = function () {
      otherWidth = Number(parseFloat(paperWidthSizeText.text.replace(',', '.')));
    }

    paperHeightSizeText.onChanging = function () {
      otherHeight = Number(parseFloat(paperHeightSizeText.text.replace(',', '.')));
    }

    checkBorderNeeded.onClick = function () {
      borderNeeded = checkBorderNeeded.value;
    }

    checkIsManyFile.onClick = function () {
      isManyFile = checkIsManyFile.value;
      fileField.children[1].text = "";
      if(isManyFile){
        fileField.children[0].text = "Mappa:";
        quantityGroup.children[0].text = "Szorzó:";
        quantityGroup.children[2].text = "x";
      }
      else{
        fileField.children[0].text = "Fájl:";
        quantityGroup.children[0].text = "Mennyiség:";
        quantityGroup.children[2].text = "db";
        
      }
    }

    paperSize.onChange = function () {
      if (paperSize.selection.text == "Körmatrica"){
        checkBorderNeeded.value = true;
        borderNeeded = checkBorderNeeded.value;
      }
      if (paperSize.selection.text == "Egyéb"){
        otherPaperWidthSizeGroup.show();
        otherPaperHeightSizeGroup.show();
      }
      else{
        otherPaperWidthSizeGroup.hide();
        otherPaperHeightSizeGroup.hide();
      }
    }

  }
  var NavigateGroup = MainWindow.add("group"); {
    NavigateGroup.orientation = "row";
    var OkButton = NavigateGroup.add("button", undefined, "OK");
    NavigateGroup.add("button", undefined, "Cancel");

    OkButton.onClick = function () {
      var result = newDocument();
      if (result != -1) {
        MainWindow.close();
      }
    }
  }
}
MainWindow.show();

function newDocument() {

  if (!isManyFile && filePath == null) {
    alert("Hiányzik a fájl!");
    return -1;
  }
  if (isManyFile && folderPath == null) {
    alert("Hiányzik a mappa!");
    return -1;
  }
  if (quantity <= 0) {
    if(!isManyFile){
      alert("Érvénytelen mennyiség!");
      return -1;
    }
  }
  if (multiplier <= 0) {
    if(isManyFile){
      alert("Érvénytelen szorzó!");
      return -1;
    }
  }

  totalQuantity = quantity * multiplier;

  preferences.rulerUnits = Units.MM;
  preferences.typeUnits = TypeUnits.MM;

  var ppi = 300;
  var onePixelinMM = 25.5 / ppi;

  var flayerWidth = 0;
  var flayerHeight = 0;
  var oneMeter2 = 1000000;

  if (paperSize.selection.text == "Nagyplakát") {
    alert("Még nincs implementálva a nagyplakát!");
    return -1;
  }
  else if (paperSize.selection.text == "Körmatrica") {
    flayerWidth = 71;
    flayerHeight = 71;
  }
  else if (paperSize.selection.text == "Egyéb") {
    flayerWidth = otherWidth;
    flayerHeight = otherHeight;
  }
  else {
    flayerWidth = Math.sqrt(oneMeter2 / (Math.sqrt(2) * Math.pow(2, paperSize.selection)));
    flayerHeight = oneMeter2 / (flayerWidth * Math.pow(2, paperSize.selection));
  }


  var rotate = false;
  var documentHeight = 0;
  var documentWidth = Number(paperWidth.selection.text);
  var columnNum = 0;
  var columnWidth = 0;
  var rowNum = 0;
  var rowHeight = 0;
  var gutter = 0;

  if (paperWidth.selection.text == "610") {
    documentWidth = documentWidth - 10.4;
  }
  else if (paperWidth.selection.text == "914") {
    documentWidth = documentWidth - 9.6;
  }
  else if (paperWidth.selection.text == "1067") {
    documentWidth = documentWidth - 10.2;
  }
  else {

  }

  var cantFit1 = false;
  var columnNum1 = Math.floor(documentWidth / flayerHeight);
  if (columnNum1 <= 0)
    cantFit1 = true;
  var columnWidth1 = flayerHeight;
  var rowNum1 = Math.ceil(totalQuantity / columnNum1);
  var rowHeight1 = flayerWidth;
  var gutter1 = (documentWidth - (columnNum1 * columnWidth1 + 2 * onePixelinMM)) / (columnNum1 - 1);
  if (gutter1 > 2)
    gutter1 = 2;
  var documentHeight1 = rowNum1 * (flayerWidth + gutter1) + 2 * onePixelinMM;

  var cantFit2 = false;
  var columnNum2 = Math.floor(documentWidth / flayerWidth);
  if (columnNum2 <= 0)
    cantFit2 = true;
  var columnWidth2 = flayerWidth;
  var rowNum2 = Math.ceil(totalQuantity / columnNum2);
  var rowHeight2 = flayerHeight;
  var gutter2 = (documentWidth - (columnNum2 * columnWidth2 + 2 * onePixelinMM)) / (columnNum2 - 1);
  if (gutter2 > 2)
    gutter2 = 2;
  var documentHeight2 = rowNum2 * (flayerHeight + gutter2) + 2 * onePixelinMM;

  var usefulArea = totalQuantity * (flayerWidth * flayerHeight);
  var wasteArea1 = documentWidth * documentHeight1 - usefulArea;
  var wasteArea2 = documentWidth * documentHeight2 - usefulArea;
  var rotate

  if (cantFit1 || cantFit2) {
    if (cantFit1 && cantFit2) {
      alert("Nem fér el semmilyen pozícióban!");
      return -1;
    }
    else if (cantFit1) {
      rotate = false;
    }
    else {
      rotate = true;
    }
  }
  else {
    if (wasteArea2 > wasteArea1) {
      rotate = true;
    }
    else {
      rotate = false;
    }
  }

  if (rotate) {
    columnNum = columnNum1;
    columnWidth = columnWidth1;
    rowNum = rowNum1;
    rowHeight = rowHeight1;
    gutter = gutter1;
    documentHeight = documentHeight1;
  }
  else {
    columnNum = columnNum2;
    columnWidth = columnWidth2;
    rowNum = rowNum2;
    rowHeight = rowHeight2;
    gutter = gutter2;
    documentHeight = documentHeight2;
  }

  var newDocument = app.documents.add(documentWidth, documentHeight, ppi, fileName, NewDocumentMode.RGB);
  activeDocument = newDocument;
  var layers = newDocument.artLayers;
  var counter = 0;



  if(isManyFile){
    for(var j = 0; j < multiplier; j++){
      for(var i = 0; i < quantity; i++){
        copyAsLayer(folderFiles[i], app.activeDocument, rotate);
      }
    }
  }
  else{
    copyAsLayer(filePath, app.activeDocument, rotate);
    var b = layers[0].bounds;
    var w = b[2] - b[0];
    var s = (columnWidth / w) * 100;
    layers[0].resize(s, s, AnchorPosition.TOPLEFT);
    for (var i = 0; i < totalQuantity - 1; i++) {
      layers[0].duplicate(newDocument);
    }
  }


  
  for (var i = 0; i < rowNum; i++) {
    for (var j = 0; j < columnNum; j++) {
      if (borderNeeded) {
        layers[counter].translate(onePixelinMM + j * (columnWidth + gutter), onePixelinMM + i * (rowHeight + gutter));
      }
      else {
        layers[counter].translate(j * (columnWidth + gutter), i * (rowHeight + gutter));
      }
      counter++;
      if (counter >= totalQuantity) {
        break;
      }
    }
  }

  if (borderNeeded) {
    var documentWidthInPt = MMtoPt(ppi, documentWidth);
    var documentHeightInPt = MMtoPt(ppi, documentHeight);
    var columnWidthInPt = MMtoPt(ppi, columnWidth);
    var rowHeightInPt = MMtoPt(ppi, rowHeight);
    var gutterInPt = MMtoPt(ppi, gutter);
    var onePixelinPt = ppi / 1245;
    app.activeDocument.artLayers.add();
    counter = 0;

    if (paperSize.selection.text != "Körmatrica") {
      for (var i = 0; i < rowNum; i++) {
        for (var k = 0; k < 2; k++) {
          var point1 = Array(0, 0);
          var point2 = Array(0, 0);
          if (k == 0) {
            point1 = Array(0, i * (rowHeightInPt + gutterInPt));
            point2 = Array(documentWidthInPt, i * (rowHeightInPt + gutterInPt));
          }
          else if (k == 1) {
            point1 = Array(0, onePixelinPt + rowHeightInPt + i * (rowHeightInPt + gutterInPt));
            point2 = Array(documentWidthInPt, onePixelinPt + rowHeightInPt + i * (rowHeightInPt + gutterInPt));
          }
          drawLine(point1, point2);
        }
      }
      for (var i = 0; i < columnNum; i++) {
        for (var k = 0; k < 2; k++) {
          var point1 = Array(0, 0);
          var point2 = Array(0, 0);
          if (k == 0) {
            point1 = Array(i * (gutterInPt + columnWidthInPt), 0);
            point2 = Array(i * (gutterInPt + columnWidthInPt), documentHeightInPt);
          }
          else if (k == 1) {
            point1 = Array(onePixelinPt + columnWidthInPt + i * (gutterInPt + columnWidthInPt), 0);
            point2 = Array(onePixelinPt + columnWidthInPt + i * (gutterInPt + columnWidthInPt), documentHeightInPt);
          }
          drawLine(point1, point2);
        }
      }
    }
    else {
      for (var i = 1; i < rowNum; i++) {
        var point1 = Array(0, 0);
        var point2 = Array(0, 0);
        point1 = Array(0, i * (rowHeightInPt + gutterInPt) - gutterInPt / 2);
        point2 = Array(documentWidthInPt, i * (rowHeightInPt + gutterInPt) - gutterInPt / 2);
        drawLine(point1, point2);
      }
    }
  }
}

function copyAsLayer(file, target, rotate) {
  var doc = app.open(file);
  if (doc.width > doc.height) {
    if (!rotate) {
      doc.rotateCanvas(90);
    }
  }
  else {
    if (rotate) {
      doc.rotateCanvas(90);
    }
  }
  var source = app.activeDocument;
  source.artLayers[0].duplicate(target);
  app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}


function MMtoPixel(ppi, value) {
  return (value / 25.5) * ppi
}

function MMtoPt(ppi, value) {
  return (value * Math.pow(ppi, 2)) / (1245 * 25.5);
}

function drawLine(point1, point2) {
  var lineArray = new Array()
  lineArray[0] = new PathPointInfo();
  lineArray[0].kind = PointKind.CORNERPOINT;
  lineArray[0].anchor = point1;
  lineArray[0].leftDirection = lineArray[0].anchor;
  lineArray[0].rightDirection = lineArray[0].anchor;

  lineArray[1] = new PathPointInfo;
  lineArray[1].kind = PointKind.CORNERPOINT;
  lineArray[1].anchor = point2;
  lineArray[1].leftDirection = lineArray[1].anchor;
  lineArray[1].rightDirection = lineArray[1].anchor;

  var lineSubPathArray = new Array();
  lineSubPathArray[0] = new SubPathInfo();
  lineSubPathArray[0].operation = ShapeOperation.SHAPEADD;
  lineSubPathArray[0].closed = false;
  lineSubPathArray[0].entireSubPath = lineArray;

  app.foregroundColor.rgb.red = 0;
  app.foregroundColor.rgb.green = 0;
  app.foregroundColor.rgb.blue = 0;

  var myPathItem = activeDocument.pathItems.add("line", lineSubPathArray);
  myPathItem.strokePath(ToolType.PENCIL);
  myPathItem.remove();
}
