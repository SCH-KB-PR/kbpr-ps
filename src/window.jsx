// ui constants
const uicHeight = 20;
const defaultMarginWidth = 5;
const propertyWidth = 80;
const dataWidth = 60;
const unitWidth = 35;
const miscWidth = 10;
const longDataWidth = dataWidth + defaultMarginWidth + unitWidth;
const buttonWidth = 80;

var mainWindow = new Window("dialog", "KBPR script - rewrite BETA", undefined, { closeButton: true });
{
    mainWindow.alignChildren = "fill";

    var modePanel = mainWindow.add("panel", undefined, "Fájl");
    {
        modePanel.alignChildren = "fill";

        // mode selection 
        var modeSelectGroup = modePanel.add("group");
        {
            modeSelectGroup.add("statictext", boundsGen(propertyWidth), "Több fájl:").justify = "right";
            var modeCheckbox = modeSelectGroup.add("checkbox");

            modeCheckbox.onClick = function () {
                multiFileMode = modeCheckbox.value;
                pathLabel.text = multiFileMode ? "Mappa:" : "Fájl:";
                pathText.text = multiFileMode ? (selectedFolder ? selectedFolder.fsName : "") : (selectedFile ? selectedFile.fsName : "");
                selectedFileList = multiFileMode ? (selectedFolder != null ? selectedFolder.getFiles() : [null]) : [selectedFile];
                quantityTypeLabel.text = multiFileMode ? "Szorzó:" : "Mennyiség:";
                quantityUnit.text = multiFileMode ? "x" : "db";
                
                preCalcGrid();
            }

            modeSelectGroup.add("statictext", boundsGen(98), ""); // spacer, dont ask
            // TODO: hopefully remove this
            var feedbackButton = modeSelectGroup.add("button", boundsGen(buttonWidth), "Hibajelzés");
            feedbackButton.onClick = function () {
                openLink("https://github.com/Gilgames32/kbpr-ps/issues/new");
            }

            var helpButton = modeSelectGroup.add("button", boundsGen(buttonWidth), "Súgó");
            helpButton.onClick = function () {
                openLink("https://github.com/Gilgames32/kbpr-ps/wiki/Dummy-guide");
            }
        }

        // path selection
        var pathGroup = modePanel.add("group");
        {
            var pathLabel = pathGroup.add("statictext", boundsGen(propertyWidth), "Fájl:");
            pathLabel.justify = "right";
            var pathText = pathGroup.add("statictext", boundsGen(longDataWidth + defaultMarginWidth + propertyWidth + defaultMarginWidth + unitWidth));
            pathText.justify = "right";
            var pathBrowseButton = pathGroup.add("button", boundsGen(buttonWidth), "Tallózás...");

            pathBrowseButton.onClick = function (){
                // folder
                if (multiFileMode) {
                    var newFolder = Folder.selectDialog("Válassz mappát");
                    if (newFolder != null) {
                        selectedFolder = newFolder;
                        selectedFileList = selectedFolder.getFiles();
                        if (selectedPaperSize == PaperSizes.OTHER) {
                            calcAspectRatio(selectedFileList[0]);
                        }
                        preCalcGrid();
                    }
                    pathText.text = selectedFolder ? (selectedFolder.fsName + " (" + selectedFileList.length + " fájl)") : "";
                }
                // file
                else {
                    var newFile = File.openDialog("Megnyitás", "All files:*.*");
                    if (newFile != null) {
                        selectedFile = newFile;
                        selectedFileList = [selectedFile];
                        if (selectedPaperSize == PaperSizes.OTHER) {
                            calcAspectRatio(selectedFile);
                        }
                        preCalcGrid();
                    }
                    pathText.text = selectedFile ? selectedFile.fsName : "";
                }
            }
        }
    }

    var paperPanel = mainWindow.add("panel", undefined, "Papír");
    {
        paperPanel.alignChildren = "fill";
        paperPanel.orientation = "row";

        // left column
        var paperStandardsGroup = paperPanel.add("group");
        {
            paperStandardsGroup.orientation = "column";
            paperStandardsGroup.alignChildren = "fill";
            
            // roll width and margin
            var rollWidthGroup = paperStandardsGroup.add("group");
            {
                rollWidthGroup.add("statictext", boundsGen(propertyWidth), "Papírhenger:").justify = "right";
                var rollWidthDropdown = rollWidthGroup.add("dropdownlist", boundsGen(dataWidth), RollWidthsArray);
                rollWidthDropdown.selection = 0;
                rollWidthGroup.add("statictext", boundsGen(unitWidth), "mm");
                rollWidthDropdown.onChange = function () {
                    selectedRollWidth = RollWidthsArray[rollWidthDropdown.selection.index];
                    preCalcGrid();
                }
            }

            // paper preset sizes
            var paperPresetGroup = paperStandardsGroup.add("group");
            {
                paperPresetGroup.add("statictext", boundsGen(propertyWidth), "Papírméret:").justify = "right";
                var paperSizeDropdown = paperPresetGroup.add("dropdownlist", boundsGen(longDataWidth));
                for (var i in PaperSizes) paperSizeDropdown.add("item", PaperSizes[i].name);
                paperSizeDropdown.selection = 4;
                paperSizeDropdown.onChange = function () {
                    selectedPaperSize = PaperSizesArray[paperSizeDropdown.selection.index];
                    paperSizeWidth.text = selectedPaperSize.width;
                    paperSizeHeight.text = selectedPaperSize.height;

                    // make the custom paper size editable
                    paperSizeGroup.enabled = selectedPaperSize == PaperSizes.OTHER;

                    // aspect ratio calculation
                    if (selectedFile != null && selectedPaperSize == PaperSizes.OTHER) calcAspectRatio(selectedFile);

                    // TODO: pusztító switch case for more presets xddd

                    // nagyplakát preset
                    if (selectedPaperSize == PaperSizes.POSTER) {
                        modeCheckbox.value = multiFileMode = false;
                        modeSelectGroup.enabled = false;

                        rollWidthGroup.enabled = false;
                        rollWidthDropdown.selection = 1; // 914

                        paperDetailsGroup.enabled = false;
                        marginField.text = margin = 0;

                        quantityPanel.enabled = false;
                        quantityField.text = quantityMultiplier = 1;
                        correctedQuantityCheckbox.value = quantityCorrectionEnabled = false;

                        layoutPanel.enabled = false;
                        gutterField.text = gutter = 0;
                        guideCheckbox.value = guide = false;
                    }
                    else {
                        modeSelectGroup.enabled = true;
                        rollWidthGroup.enabled = true;
                        paperDetailsGroup.enabled = true;
                        quantityPanel.enabled = true;
                        layoutPanel.enabled = true;
                    }

                    // circlemask only for stickers, badges, and custom sizes
                    if (selectedPaperSize == PaperSizes.STICKER) {
                        circleMaskGroup.enabled = circleMaskCheckBox.value = circleMask = true;
                        paperResolutionDropdown.selection = 1; // 600 ppi
                    }
                    else if (selectedPaperSize == PaperSizes.OTHER || selectedPaperSize == PaperSizes.BADGE) {
                        circleMaskGroup.enabled = true; // leave value unchanged
                    }
                    else {
                        circleMaskGroup.enabled = circleMaskCheckBox.value = circleMask = false;
                    }

                    preCalcGrid();
                }
            }

            var paperResolutionGroup = paperStandardsGroup.add("group");
            {
                paperResolutionGroup.add("statictext", boundsGen(propertyWidth), "Felbontás:").justify = "right";
                var paperResolutionDropdown = paperResolutionGroup.add("dropdownlist", boundsGen(dataWidth), ResolutionArray);
                paperResolutionDropdown.selection = 0;
                paperResolutionGroup.add("statictext", boundsGen(unitWidth), "ppi");
                paperResolutionDropdown.onChange = function () {
                    ppi = ResolutionArray[paperResolutionDropdown.selection.index];
                }
            }
        }


        // paper size selection
        var paperDetailsGroup = paperPanel.add("group");
        {
            paperDetailsGroup.orientation = "column";

            // roll margin
            var rollMarginGroup = paperDetailsGroup.add("group");
            {
                rollMarginGroup.add("statictext", boundsGen(propertyWidth), "Margó:").justify = "right";
                var marginField = rollMarginGroup.add("edittext", boundsGen(dataWidth), margin);
                rollMarginGroup.add("statictext", boundsGen(unitWidth), "mm");
                marginField.onChange = function () {
                    margin = parseHuFloat(marginField.text);
                    if (isNaN(margin) || margin < 0) margin = 0;
                    marginField.text = margin;
                    preCalcGrid();
                }
            }

            // custom paper size
            var paperSizeGroup = paperDetailsGroup.add("group");
            {
                paperSizeGroup.orientation = "row";
                paperStandardsGroup.alignChildren = "fill";

                paperSizeGroup.add("statictext", boundsGen(propertyWidth - 36)); // spacer, magic number :D
                var lockRatioCheckbox = paperSizeGroup.add("checkbox");
                lockRatioCheckbox.value = fileAspectLock;
                lockRatioCheckbox.onClick = function () {
                    fileAspectLock = lockRatioCheckbox.value;
                    paperSizeWidth.notify();
                }

                var paperDimensionsGroup = paperSizeGroup.add("group");
                {
                    paperDimensionsGroup.orientation = "column";
                    var paperSizeWidthGroup = paperDimensionsGroup.add("group");
                    var paperSizeHeightGroup = paperDimensionsGroup.add("group");

                    var paperSizeWidth = paperSizeWidthGroup.add("edittext", boundsGen(dataWidth), selectedPaperSize.width);
                    var paperSizeHeight = paperSizeHeightGroup.add("edittext", boundsGen(dataWidth), selectedPaperSize.height);
                    paperSizeWidthGroup.add("statictext", boundsGen(unitWidth), "mm");
                    paperSizeHeightGroup.add("statictext", boundsGen(unitWidth), "mm");

                    paperSizeWidth.onChange = function () {
                        selectedPaperSize.width = parseHuFloat(paperSizeWidth.text);
                        if (isNaN(selectedPaperSize.width) || selectedPaperSize.width < 1) selectedPaperSize.width = 1;

                        if (fileAspectLock) selectedPaperSize.height = selectedPaperSize.width / selectedFileAspect;

                        paperSizeWidth.text = selectedPaperSize.width;
                        paperSizeHeight.text = selectedPaperSize.height;
                        preCalcGrid();
                    }
                    paperSizeHeight.onChange = function () {
                        selectedPaperSize.height = parseHuFloat(paperSizeHeight.text);
                        if (isNaN(selectedPaperSize.height) || selectedPaperSize.height < 1) selectedPaperSize.height = 1;

                        if (fileAspectLock) selectedPaperSize.width = selectedPaperSize.height * selectedFileAspect;

                        paperSizeHeight.text = selectedPaperSize.height;
                        paperSizeWidth.text = selectedPaperSize.width;
                        preCalcGrid();
                    }
                }

                paperSizeGroup.enabled = false;
            }
        }
    }

    // quantity and correction
    var quantityPanel = mainWindow.add("panel", undefined, "Mennyiség");
    {
        quantityPanel.orientation = "row";

        var quantityTypeLabel = quantityPanel.add("statictext", boundsGen(propertyWidth), "Mennyiség:");
        quantityTypeLabel.justify = "right";
        var quantityField = quantityPanel.add("edittext", boundsGen(dataWidth), quantityMultiplier);
        var quantityUnit = quantityPanel.add("statictext", boundsGen(unitWidth), "db");

        quantityPanel.add("statictext", boundsGen(propertyWidth), "Korrigálás:").justify = "right";
        var correctedQuantityCheckbox = quantityPanel.add("checkbox", boundsGen(miscWidth));
        var correctedQuantityText = quantityPanel.add("statictext", boundsGen(unitWidth), correctedQuantity + " db");
        correctedQuantityText.enabled = quantityCorrectionEnabled;

        quantityField.onChange = function () {
            quantityMultiplier = parseInt(quantityField.text);
            if (isNaN(quantityMultiplier) || quantityMultiplier < 1) quantityMultiplier = 1;
            quantityField.text = quantityMultiplier;

            preCalcGrid();
        }

        correctedQuantityCheckbox.onClick = function () {
            correctedQuantityText.enabled = quantityCorrectionEnabled = correctedQuantityCheckbox.value;
            preCalcGrid();
        }
    }

    // gutter, guide and circle mask
    var layoutPanel = mainWindow.add("panel", undefined, "Elrendezés");
    {
        layoutPanel.alignChildren = "fill";
        layoutPanel.orientation = "row";

        var layoutSettingsGroup = layoutPanel.add("group");
        {
            layoutSettingsGroup.alignChildren = "fill";
            layoutSettingsGroup.orientation = "column";

            // gutter
            var gutterGroup = layoutSettingsGroup.add("group");
            {
                gutterGroup.add("statictext", boundsGen(propertyWidth), "Köz:").justify = "right";
                var gutterField = gutterGroup.add("edittext", boundsGen(dataWidth), gutter);
                gutterUnit = gutterGroup.add("statictext", boundsGen(unitWidth), "mm");
                gutterField.onChange = function () {
                    gutter = parseHuFloat(gutterField.text);
                    if (isNaN(gutter) || gutter < 0) gutter = 0;
                    gutterField.text = gutter;
                    preCalcGrid();
                }
            }

            // guide
            var guideGroup = layoutSettingsGroup.add("group");
            {
                guideGroup.add("statictext", boundsGen(propertyWidth), "Segédvonalak:").justify = "right";
                var guideCheckbox = guideGroup.add("checkbox", boundsGen(dataWidth));
                guideCheckbox.value = guide;
                guideCheckbox.onClick = function () {
                    guide = guideCheckbox.value;
                }
            }

            // circle mask
            var circleMaskGroup = layoutSettingsGroup.add("group");
            {
                circleMaskGroup.add("statictext", boundsGen(propertyWidth), "Körmaszk:").justify = "right";
                var circleMaskCheckBox = circleMaskGroup.add("checkbox", boundsGen(dataWidth));
                circleMaskCheckBox.value = circleMask;
                circleMaskCheckBox.onClick = function () {
                    circleMask = circleMaskCheckBox.value;
                }

                circleMaskGroup.enabled = false;
            }
        }

        var preCalcInfoGroup = layoutPanel.add("group");
        {
            preCalcInfoGroup.orientation = "row"
            var preCalcInfoKeys = preCalcInfoGroup.add("statictext", boundsGen(propertyWidth, uicHeight * 4), "", { multiline: true });
            preCalcInfoKeys.justify = "right";
            preCalcInfoKeys.enabled = false;
            var preCalcInfoValues = preCalcInfoGroup.add("statictext", boundsGen(longDataWidth, uicHeight * 4), ":3", { multiline: true });
            preCalcInfoValues.enabled = false;
        }

    }

    // bottom buttons
    var submitGroup = mainWindow.add("group");
    {
        submitGroup.alignment = "center";
        var submitButton = submitGroup.add("button", undefined, "OK");
        submitButton.onClick = function () {
            if (createImage()) mainWindow.close();
        }

        var cancelButton = submitGroup.add("button", undefined, "Mégse");
        cancelButton.onClick = function () {
            mainWindow.close();
        }
    }
}

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

function boundsGen(w, h) {
    if (h == undefined) h = uicHeight; // because we cant have default parameters for some reason
    return [0, 0, w, h];
}

function parseHuFloat(text) {
    return parseFloat(text.replace(",", "."));
}

function calcAspectRatio(file) {
    // no unfortunately there is no way to get the aspect ratio of an image without opening it ._.
    var doc = app.open(file);
    selectedFileAspect = doc.width / doc.height;
    doc.close(SaveOptions.DONOTSAVECHANGES);
    paperSizeWidth.notify();
}

function openLink(url) {
    try {
        // windows
        app.system("start " + url);
    } catch (error) {
        try {
            // mac
            app.system("open " + url);
        } catch (error) {
            // just in case
            alert(url);
        }
    }
}