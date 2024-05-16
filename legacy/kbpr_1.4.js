#target 'photoshop'

var propertyWidth = 130;
var dataWidth = 100;
var unitWidth = 70;
var height = 22;

var paperWidth = 0;
var paperSize;
var fileName = "Untitled";
var quantity = 0;
var filePath = null;
var borderNeeded = false;
var check;

var MainWindow = new Window('dialog', 'KBPR script', undefined, {closeButton: true});{
  var InputGroup = MainWindow.add("group");{
    InputGroup.orientation = "column";
    InputGroup.alignChildren = "left";
    var file = InputGroup.add("group");{
      file.add("statictext", [0,0,propertyWidth,height], "Fájlnév:");
      var filePathText = file.add("statictext",  [0,0,200,height]);
      var browseButton = file.add('button', [0,0,unitWidth,height], 'Browse');
      browseButton.onClick = function() {
        filePath = File.openDialog("Selection prompt");
        if(filePath != null){
          fileName = filePath.name;
          filePathText.text = filePath.name;
        }
      }
    }
    var paperWidthGroup = InputGroup.add("group");{
      paperWidthGroup.add("statictext", [0,0,propertyWidth,height], "Papírhenger szélesség:");
      paperWidth = paperWidthGroup.add("dropdownlist", [0,0,dataWidth,height], ["610", "914", "1067"]);
      paperWidth.selection = 0;
      paperWidthGroup.add("statictext", [0,0,unitWidth,height], "mm");
    }
    var paperSizeGroup = InputGroup.add("group");{
      paperSizeGroup.add("statictext", [0,0,propertyWidth,height], "Papírméret:");
      paperSize = paperSizeGroup.add ("dropdownlist", [0,0,dataWidth,height], ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "Nagyplakát"]);
      paperSize.selection = 4;
      paperSizeGroup.add("statictext", [0,0,unitWidth,height], "");
    }
    var quantityGroup = InputGroup.add("group");{
      quantityGroup.alignChildren = "left";
      quantityGroup.add("statictext", [0,0,propertyWidth,height], "Mennyiség:");
      quantityText = quantityGroup.add("edittext", [0,0,dataWidth,height], "20");
      quantity = Number(quantityText.text);
      quantityGroup.add("statictext", [0,0,unitWidth,height], "db");
    }
    var borderGroup = InputGroup.add("group");{
      borderGroup.alignChildren = "left";
      borderGroup.add("statictext", [0,0,propertyWidth,height], "Segítő határ:");
      check = borderGroup.add("checkbox", [0,0,dataWidth,height]);
      borderNeeded = check.value;
    }

    quantityText.onChanging = function () {
      quantity = Number(quantityText.text);
    }

    check.onClick  = function () {
      borderNeeded = check.value;
    }

  }
  var NavigateGroup = MainWindow.add("group");{
    NavigateGroup.orientation = "row";
    var OkButton = NavigateGroup.add ("button", undefined, "OK");
    NavigateGroup.add ("button", undefined, "Cancel");

    OkButton.onClick = function() {
      var result = newDocument();
      if(result != -1){
        MainWindow.close();
      }
    }
  }
}
MainWindow.show();


function newDocument(){

  if(filePath == null){
    alert("Hiányzik a fájl!");
    return -1;
  }
  if(quantity <= 0){
    alert("Érvénytelen mennyiség!");
    return -1;
  }

  preferences.rulerUnits = Units.MM;
  preferences.typeUnits = TypeUnits.MM;

  var ppi = 300;
  var onePixelinMM = 25.5/ppi;

  var flayerWidth = 0;
  var flayerHeight = 0;
  var oneMeter2 = 1000000;

  if(paperSize.selection.text != "Nagyplakát"){
    flayerWidth = Math.sqrt(oneMeter2/(Math.sqrt(2)*Math.pow(2, paperSize.selection)));
    flayerHeight = oneMeter2/(flayerWidth*Math.pow(2, paperSize.selection));
  }
  else{
    alert("Még nincs implementálva a nagyplakát!");
    return -1;
  }
  
  var rotate = false;
  var documentHeight = 0;
  var documentWidth = Number(paperWidth.selection.text);
  var columnNum = 0;
  var columnWidth = 0;
  var rowNum = 0;
  var rowHeight = 0;
  var gutter = 0;

  if(paperWidth.selection.text == "610"){
    documentWidth = documentWidth - 10.4;
  }
  else if(paperWidth.selection.text == "914"){
    documentWidth = documentWidth - 9.6;
  }
  else if(paperWidth.selection.text == "1067"){
    documentWidth = documentWidth - 10.2;
  }
  else{

  }

  var cantFit1 = false;
  var columnNum1 = Math.floor(documentWidth/flayerHeight);
  if(columnNum1 <= 0)
    cantFit1 = true;
  var columnWidth1 = flayerHeight;
  var rowNum1 = Math.ceil(quantity/columnNum1);
  var rowHeight1 = flayerWidth;
  var gutter1 = (documentWidth - (columnNum1 * columnWidth1 + 2 * onePixelinMM))/(columnNum1-1);
  if(gutter1 > 2)
    gutter1 = 2;
  var documentHeight1 = rowNum1*(flayerWidth+gutter1) + 2 * onePixelinMM;
    
  var cantFit2 = false;
  var columnNum2 = Math.floor(documentWidth/flayerWidth);
  if(columnNum2 <= 0)
    cantFit2 = true;
  var columnWidth2 = flayerWidth;
  var rowNum2 = Math.ceil(quantity/columnNum2);
  var rowHeight2 = flayerHeight;
  var gutter2 = (documentWidth - (columnNum2 * columnWidth2 + 2 * onePixelinMM))/(columnNum2-1);
  if(gutter2 > 2)
    gutter2 = 2;
  var documentHeight2 = rowNum2*(flayerHeight+gutter2) + 2 * onePixelinMM;

  var usefulArea = quantity * (flayerWidth * flayerHeight);
  var wasteArea1 = documentWidth * documentHeight1 - usefulArea;
  var wasteArea2 = documentWidth * documentHeight2 - usefulArea;
  var rotate

  if(cantFit1 || cantFit2){
    if(cantFit1 && cantFit2){
        alert("Nem fér el semmilyen pozícióban!");
        return -1;
    }
    else if(cantFit1){
        rotate = false;
    }
    else{
        rotate = true;
    }
  }
  else{
    if(wasteArea2 > wasteArea1){
        rotate = true;
    }
    else{
        rotate = false;
    }
  }
    
  if(rotate){
      columnNum = columnNum1;
      columnWidth = columnWidth1;
      rowNum = rowNum1;
      rowHeight = rowHeight1;
      gutter = gutter1;
      documentHeight = documentHeight1;
  }
  else{
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

  copyAsLayer(filePath, app.activeDocument, rotate);
  var b = layers[0].bounds;
  var w = b[2]-b[0];
  var s = (columnWidth/w)*100;
  layers[0].resize(s,s,AnchorPosition.TOPLEFT);
  for(var i = 0; i < quantity - 1; i++){
    layers[0].duplicate(newDocument);
  }
  for(var i = 0; i < rowNum; i++){
    for(var j = 0; j < columnNum; j++){
      if(borderNeeded){
        layers[counter].translate(onePixelinMM + j*(columnWidth + gutter), onePixelinMM + i*(rowHeight + gutter));
      }
      else{
        layers[counter].translate(j*(columnWidth + gutter), i*(rowHeight + gutter));
      }
      counter++;
      if(counter >= quantity){
        break;
      }
    }
  }

  if(borderNeeded){
    var documentWidthInPt = MMtoPt(ppi, documentWidth);
    var documentHeightInPt = MMtoPt(ppi, documentHeight);
    var columnWidthInPt = MMtoPt(ppi, columnWidth);
    var rowHeightInPt = MMtoPt(ppi, rowHeight);
    var gutterInPt = MMtoPt(ppi, gutter);
    var onePixelinPt = ppi/1245;
    app.activeDocument.artLayers.add();
    counter = 0;

    for(var i = 0; i < rowNum; i++){
      for(var k = 0; k < 2; k++){
        var point1 = Array(0,0);
        var point2 = Array(0,0);
        if(k == 0){
          point1 = Array(0,                 i*(rowHeightInPt + gutterInPt));
          point2 = Array(documentWidthInPt, i*(rowHeightInPt + gutterInPt));
        }
        else if(k == 1){
          point1 = Array(0,                 onePixelinPt + rowHeightInPt + i*(rowHeightInPt + gutterInPt));
          point2 = Array(documentWidthInPt, onePixelinPt + rowHeightInPt + i*(rowHeightInPt + gutterInPt));
        }
        drawLine(point1, point2);
      }
    }
    for(var i = 0; i < columnNum; i++){
      for(var k = 0; k < 2; k++){
        var point1 = Array(0,0);
        var point2 = Array(0,0);
        if(k == 0){
          point1 = Array(i*(gutterInPt + columnWidthInPt), 0);
          point2 = Array(i*(gutterInPt + columnWidthInPt), documentHeightInPt);
        }
        else if(k == 1){
          point1 = Array(onePixelinPt + columnWidthInPt + i*(gutterInPt + columnWidthInPt), 0);
          point2 = Array(onePixelinPt + columnWidthInPt + i*(gutterInPt + columnWidthInPt), documentHeightInPt);
        }
        drawLine(point1, point2);
      }
    }
  }
}

function copyAsLayer(file, target, rotate){
	var doc = app.open(file);
  if(doc.width > doc.height){
    if(!rotate){
      doc.rotateCanvas(90);
    }
  }
  else{
    if(rotate){
      doc.rotateCanvas(90);
    }
  }
  var source = app.activeDocument;
	source.artLayers[0].duplicate(target);
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}


function MMtoPixel(ppi, value){
  return (value/25.5)*ppi
}

function MMtoPt(ppi, value){
  return (value * Math.pow(ppi, 2))/(1245 * 25.5);
}

function drawLine(point1, point2){
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
