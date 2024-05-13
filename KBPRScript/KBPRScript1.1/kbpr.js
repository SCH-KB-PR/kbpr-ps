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
        fileName = filePath.name;
        filePathText.text = filePath.name;
      }
    }
    var paperWidthGroup = InputGroup.add("group");{
      paperWidthGroup.add("statictext", [0,0,propertyWidth,height], "Papírhenger szélesség:");
      paperWidth = paperWidthGroup.add("dropdownlist", [0,0,dataWidth,height], ["610", "914"]);
      paperWidth.selection = 0;
      paperWidthGroup.add("statictext", [0,0,unitWidth,height], "mm");
    }
    var paperSizeGroup = InputGroup.add("group");{
      paperSizeGroup.add("statictext", [0,0,propertyWidth,height], "Papírméret:");
      paperSize = paperSizeGroup.add ("dropdownlist", [0,0,dataWidth,height], ["A0", "A1", "A2", "A3", "A4", "A5", "A6"]);
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

    quantityText.onChanging = function () {
      quantity = Number(quantityText.text);
    }

  }
  var NavigateGroup = MainWindow.add("group");{
    NavigateGroup.orientation = "row";
    var OkButton = NavigateGroup.add ("button", undefined, "OK");
    NavigateGroup.add ("button", undefined, "Cancel");

    OkButton.onClick = function() {
      newDocument();
      MainWindow.close();
    }
  }
}
MainWindow.show();


function newDocument(){
  preferences.rulerUnits = Units.MM;
  preferences.typeUnits = TypeUnits.MM;


  var dpi = 300;

  var flayerWidth = 0;
  var flayerHeight = 0;
  var oneMeter2 = 1000000;

  var flayerWidth = Math.sqrt(oneMeter2/(Math.sqrt(2)*Math.pow(2, paperSize.selection)));
  var flayerHeight = oneMeter2/(flayerWidth*Math.pow(2, paperSize.selection));

  var gutterHight = 4;
  var rotate = false;
  var documentHeight = 0;
  var documentWidth = Number(paperWidth.selection.text);
  var columnNum = 0;
  var columnWidth = 0;
  var rowNum = 0;
  var rowHeight = 0;
  var gutter = 0;

  if(paperSize.selection != 0){

    documentWidth = documentWidth - 10.4;

    rotate = paperSize.selection % 2 == 0;
    if(rotate){
      columnNum = Math.floor(documentWidth/flayerHeight);
      columnWidth = flayerHeight;
      rowNum = Math.ceil(quantity/columnNum);
      rowHeight = flayerWidth;
      gutter = (documentWidth - columnNum * columnWidth)/(columnNum-1);
      documentHeight = rowNum*(flayerWidth+gutter)-gutter;
    }
    else{
      columnNum = Math.floor(documentWidth/flayerWidth);
      columnWidth = flayerWidth;
      rowNum = Math.ceil(quantity/columnNum);
      rowHeight = flayerHeight;
      gutter = (documentWidth - columnNum * columnWidth)/(columnNum-1);
      documentHeight = rowNum*(flayerHeight+gutter)-gutter;
    }

    var newDocument = app.documents.add(documentWidth, documentHeight, dpi, fileName, NewDocumentMode.RGB);
    activeDocument = newDocument;
    var layers = newDocument.artLayers;
    var counter = 0;

    if(filePath.exists){
      copyAsLayer(filePath, app.activeDocument, rowHeight, rotate);
      for(var i = 0; i < quantity - 1; i++){
        layers[0].duplicate(newDocument);
      }

      for(var i = 0; i < rowNum; i++){
        for(var j = 0; j < columnNum; j++){
          if(j == 0){
            layers[counter].translate(0, i*(rowHeight + gutter));
          }
          else{
            layers[counter].translate(0 + j*(columnWidth + gutter), i*(rowHeight + gutter));
          }
          counter++;
          if(counter >= quantity){
            break;
          }
        }
      }
    }
  }
  else{

  }
}

function copyAsLayer(file, target, height, rotate){
	var doc = app.open(file);
  if(rotate)
    doc.rotateCanvas(90);
  doc.resizeImage(null,UnitValue(height,"mm"),null,ResampleMethod.BICUBIC);
  var source = app.activeDocument;
	source.artLayers[0].duplicate(target);
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}


function MMtoPixel(dpi, value){
  return (value/25.4)*dpi
}

