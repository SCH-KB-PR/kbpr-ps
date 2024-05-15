#target "photoshop"
#include "document.jsx"

const propertyWidth = 130;
const dataWidth = 100;
const unitWidth = 70;
const height = 20;


const FileModes = {
    FILE: "Fájl",
    FOLDER: "Mappa"
};
const FileModesArray = getValues(FileModes); // i despise this language

const RollWidthsArray = [610, 914, 1067];

const PaperSizes = {
    A0: { name: "A0", width: 841, height: 1189 },
    A1: { name: "A1", width: 594, height: 841 },
    A2: { name: "A2", width: 420, height: 594 },
    A3: { name: "A3", width: 297, height: 420 },
    A4: { name: "A4", width: 210, height: 297 },
    A5: { name: "A5", width: 148, height: 210 },
    A6: { name: "A6", width: 105, height: 148 },
    A7: { name: "A7", width: 74, height: 105 },
    POSTER: { name: "Nagyplakát", width: 1000, height: 1000 }, // invalid
    STICKER: { name: "Körmatrica", width: 71, height: 71 }, // invalid
    OTHER: { name: "Egyéb...", width: 100, height: 100 } // invalid
};
const PaperSizesArray = getValues(PaperSizes);

var selectedFileAspect = 1; // width / height
var selectedFile = null;
var selectedFolder = null;
var selectedMode = FileModes.FILE;
var selectedRollWidth = RollWidthsArray[0];
var selectedPaperSize = PaperSizes.A4;
var quantity = 20;
var quantityCorrectionEnabled = false;
var margin = 0;
var gutter = 2;
var guide = false;

var mainWindow = new Window("dialog", "KBPR script - REWRITE BETA", undefined, { closeButton: true });
{
    mainWindow.alignChildren = "fill";

    var modePanel = mainWindow.add("panel");
    {
        modePanel.alignChildren = "fill";
        var modeSelectGroup = modePanel.add("group");
        {
            // label
            modeSelectGroup.add("statictext", boundsGen(propertyWidth), "Mód:");

            // field
            var modeDropdown = modeSelectGroup.add("dropdownlist", boundsGen(dataWidth));
            for (var mode in FileModes) modeDropdown.add("item", FileModes[mode]);
            modeDropdown.selection = 0;

            modeDropdown.onChange = function () {
                pathModeChanged(modeDropdown.selection);
            }
        }

        var pathGroup = modePanel.add("group");
        {
            var pathLabel = pathGroup.add("statictext", boundsGen(propertyWidth), "Path:");
            var pathText = pathGroup.add("statictext", [0, 0, 200, height]);
            pathText.justify = "right";
            var pathBrowseButton = pathGroup.add("button", boundsGen(unitWidth), "Tallózás...");
        }

        function pathModeChanged(selection) {
            selectedMode = FileModesArray[selection.index];

            if (selectedMode == FileModes.FILE) {
                pathLabel.text = selectedMode + ":";
                pathText.text = selectedFile ? selectedFile.fsName : "";
                pathBrowseButton.onClick = function () {
                    var newFile = File.openDialog("Megnyitás", "All files:*.*");
                    if (newFile != null) {
                        selectedFile = newFile;
                        if (selectedPaperSize == PaperSizes.OTHER) {
                            calcAspectRatio(selectedFile);
                        }
                    }
                    pathText.text = selectedFile ? selectedFile.fsName : "";

                }
            }

            else if (selectedMode == FileModes.FOLDER) {
                pathLabel.text = selectedMode + ":";
                pathText.text = selectedFolder ? selectedFolder.fsName : "";
                pathBrowseButton.onClick = function () {
                    var newFolder = Folder.selectDialog("Válassz mappát");
                    if (newFolder != null) selectedFolder = newFolder;
                    pathText.text = selectedFolder ? selectedFolder.fsName : "";
                }
            }
        }
    }


    var paperPanel = mainWindow.add("panel", undefined, "Papírbeállítások");
    {
        paperPanel.alignChildren = "fill";
        var rollWidthGroup = paperPanel.add("group");
        {
            rollWidthGroup.add("statictext", boundsGen(propertyWidth), "Papírhenger szélesség:");
            var rollWidthDropdown = rollWidthGroup.add("dropdownlist", boundsGen(dataWidth), RollWidthsArray);
            rollWidthDropdown.selection = 0;
            rollWidthGroup.add("statictext", boundsGen(unitWidth), "mm");
            rollWidthDropdown.onChange = function () {
                selectedRollWidth = RollWidthsArray[rollWidthDropdown.selection.index];
                preCalcGrid();
            }
        }

        var paperSizeGroup = paperPanel.add("group");
        {
            paperSizeGroup.add("statictext", boundsGen(propertyWidth), "Papírméret:");
            var paperSizeDropdown = paperSizeGroup.add("dropdownlist", boundsGen(dataWidth));
            for (var i in PaperSizes) paperSizeDropdown.add("item", PaperSizes[i].name);
            paperSizeDropdown.selection = 4;
            paperSizeDropdown.onChange = function () {
                selectedPaperSize = PaperSizesArray[paperSizeDropdown.selection.index];
                paperSizeWidth.text = selectedPaperSize.width;
                paperSizeHeight.text = selectedPaperSize.height;
                paperSizeHeight.enabled = paperSizeWidth.enabled = selectedPaperSize == PaperSizes.OTHER;
                if (selectedFile != null && selectedPaperSize == PaperSizes.OTHER) calcAspectRatio(selectedFile);
                preCalcGrid();
            }
        }

        var paperInfoGroup = paperPanel.add("group");
        {
            paperInfoGroup.orientation = "row";
            paperInfoGroup.add("statictext", boundsGen(propertyWidth), "");
            var paperSizeWidth = paperInfoGroup.add("edittext", boundsGen(50), selectedPaperSize.width);
            paperInfoGroup.add("statictext", boundsGen(10), "\u00D7"); // ×
            var paperSizeHeight = paperInfoGroup.add("edittext", boundsGen(50), selectedPaperSize.height);
            paperInfoGroup.add("statictext", boundsGen(unitWidth), "mm");

            paperSizeWidth.enabled = paperSizeHeight.enabled = false;
            paperSizeWidth.onChange = function () {
                selectedPaperSize.width = parseHuFloat(paperSizeWidth.text);
                if (isNaN(selectedPaperSize.width) || selectedPaperSize.width < 1) selectedPaperSize.width = 1;
                selectedPaperSize.height = selectedPaperSize.width / selectedFileAspect;

                paperSizeWidth.text = selectedPaperSize.width;
                paperSizeHeight.text = selectedPaperSize.height;
                preCalcGrid();
            }
            paperSizeHeight.onChange = function () {
                selectedPaperSize.height = parseHuFloat(paperSizeHeight.text);
                if (isNaN(selectedPaperSize.height) || selectedPaperSize.height < 1) selectedPaperSize.height = 1;
                selectedPaperSize.width = selectedPaperSize.height * selectedFileAspect;

                paperSizeHeight.text = selectedPaperSize.height;
                paperSizeWidth.text = selectedPaperSize.width;
                preCalcGrid();
            }
        }

    }


    var quantityPanel = mainWindow.add("panel");
    {
        quantityPanel.orientation = "row";
        quantityPanel.add("statictext", boundsGen(propertyWidth), "Mennyiség:");
        var quantityField = quantityPanel.add("edittext", boundsGen(dataWidth), quantity);
        var quantityUnit = quantityPanel.add("statictext", boundsGen(unitWidth), "db");

        quantityPanel.add("statictext", boundsGen(50), "Korrigálás");
        var correctedQuantityCheckbox = quantityPanel.add("checkbox");
        var correctedQuantityText = quantityPanel.add("statictext", boundsGen(dataWidth), quantity + " db");
        correctedQuantityText.enabled = quantityCorrectionEnabled;

        quantityField.onChange = function () {
            quantity = parseInt(quantityField.text);
            if (isNaN(quantity) || quantity < 1) quantity = 1;
            quantityField.text = quantity;

            preCalcGrid();
        }

        correctedQuantityCheckbox.onClick = function () {
            correctedQuantityText.enabled = quantityCorrectionEnabled = correctedQuantityCheckbox.value;
        }
    }

    var layoutPanel = mainWindow.add("panel", undefined, "Elrendezés");
    {
        layoutPanel.alignChildren = "fill";

        var marginGroup = layoutPanel.add("group");
        {
            marginGroup.add("statictext", boundsGen(propertyWidth), "Margó:");
            var marginField = marginGroup.add("edittext", boundsGen(dataWidth), margin);
            var marginUnit = marginGroup.add("statictext", boundsGen(unitWidth), "mm");
            marginField.onChange = function () {
                margin = parseHuFloat(marginField.text);
                if (isNaN(margin) || margin < 0) margin = 0;
                marginField.text = margin;
                preCalcGrid();
            }
        }


        var gutterGroup = layoutPanel.add("group");
        {
            gutterGroup.add("statictext", boundsGen(propertyWidth), "Köz:");
            var gutterField = gutterGroup.add("edittext", boundsGen(dataWidth), gutter);
            var gutterUnit = gutterGroup.add("statictext", boundsGen(unitWidth), "mm");
            gutterField.onChange = function () {
                gutter = parseHuFloat(gutterField.text);
                if (isNaN(gutter) || gutter < 0) gutter = 0;
                gutterField.text = gutter;
                preCalcGrid();
            }
        }


        var guideGroup = layoutPanel.add("group");
        {
            guideGroup.add("statictext", boundsGen(propertyWidth), "Segédvonalak:");
            var guideCheckbox = guideGroup.add("checkbox", boundsGen(dataWidth));
            guideCheckbox.value = guide;
            guideCheckbox.onClick = function () {
                guide = guideCheckbox.value;
            }
        }

    }


    var submitGroup = mainWindow.add("group");
    {
        submitGroup.alignment = "center";
        var submitButton = submitGroup.add("button", boundsGen(100), "OK");
        submitButton.onClick = function () {
            if (create()) mainWindow.close();
        }

        var cancelButton = submitGroup.add("button", boundsGen(100), "Mégse");
        cancelButton.onClick = function () {
            mainWindow.close();
        }
    }
}

// initialize
modeDropdown.onChange();
preCalcGrid();
mainWindow.show();

// Object.values() is not supported in ES3 :(
function getValues(obj) {
    var values = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            values.push(obj[key]);
        }
    }
    return values;
}

function boundsGen(width) {
    return [0, 0, width, height];
}

function parseHuFloat(text) {
    return parseFloat(text.replace(",", "."));
}

function calcAspectRatio(file) {
    // no unfortunately there is no way to get the aspect ratio of an image without opening it ._.
    var doc = app.open(file);
    selectedFileAspect = doc.width / doc.height;
    doc.close(SaveOptions.DONOTSAVECHANGES);
    paperSizeWidth.onChange();
}