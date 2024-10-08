// ui constants
const uicHeight = 20;
const defaultMarginWidth = 5;
const propertyWidth = 80;
const dataWidth = 60;
const unitWidth = 35;
const miscWidth = 10;
const longDataWidth = dataWidth + defaultMarginWidth + unitWidth;
const buttonWidth = 80;

var mainWindow = new Window("dialog", "KBPR script", undefined, { closeButton: true });
{
    mainWindow.alignChildren = "fill";

    var modePanel = mainWindow.add("panel", undefined, "Fájl");
    {
        modePanel.alignChildren = "fill";

        // mode selection 
        var modeSelectGroup = modePanel.add("group");
        {
            var modeSelectLabel = modeSelectGroup.add("statictext", boundsGen(propertyWidth), "Több fájl:")
            modeSelectLabel.justify = "right";
            modeSelectLabel.helpTip = "Be: kiválaszott mappa összes fájlja\nKi: kiválaszott fájl";
            var modeCheckbox = modeSelectGroup.add("checkbox");

            modeCheckbox.onClick = function () {
                multiFileMode = modeCheckbox.value;
                pathLabel.text = multiFileMode ? "Mappa:" : "Fájl:";
                pathText.text = multiFileMode ? (selectedFolder ? selectedFolder.fsName : "") : (selectedFile ? selectedFile.fsName : "");
                selectedFileList = multiFileMode ? (selectedFolder != null ? selectedFolder.getFiles() : [null]) : [selectedFile];
                quantityTypeLabel.text = multiFileMode ? "Szorzó:" : "Mennyiség:";
                quantityUnit.text = multiFileMode ? "x" : "db";
                quantityField.text = quantityMultiplier = multiFileMode ? 1 : quantityMultiplier;
                
                preCalcGrid();
            }

            modeSelectGroup.add("statictext", boundsGen(98), ""); // spacer, dont ask
            // TODO: hopefully remove this
            var feedbackButton = modeSelectGroup.add("button", boundsGen(buttonWidth), "Hibajelzés");
            feedbackButton.onClick = function () {
                openLink("https://github.com/SCH-KB-PR/kbpr-ps/issues/new/choose");
            }

            var helpButton = modeSelectGroup.add("button", boundsGen(buttonWidth), "Súgó");
            helpButton.onClick = function () {
                openLink("https://github.com/SCH-KB-PR/kbpr-ps/wiki");
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
                var rollWidthLabel = rollWidthGroup.add("statictext", boundsGen(propertyWidth), "Papírtekercs:")
                rollWidthLabel.justify = "right";
                rollWidthLabel.helpTip = "Behelyezett papírtekercs szélesség";
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
                var paperPresetLabel = paperPresetGroup.add("statictext", boundsGen(propertyWidth), "Cellaméret:")
                paperPresetLabel.justify = "right";
                paperPresetLabel.helpTip = "Papírméret";
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
                    if (selectedPaperSize == PaperSizes.OTHER) 
                    {
                        if (selectedFile != null) calcAspectRatio(selectedFile);
                        if (selectedFolder != null) calcAspectRatio(selectedFileList[0]);
                    }

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
                    if (selectedPaperSize == PaperSizes.STICKER70 || selectedPaperSize == PaperSizes.STICKER49) {
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
                var paperResolutionLabel = paperResolutionGroup.add("statictext", boundsGen(propertyWidth), "Felbontás:")
                paperResolutionLabel.justify = "right";
                paperResolutionLabel.helpTip = "Nyomtatási részletesség\nÁltalános esetben 300 ppi\nMatricákhoz 600 ppi";
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
                var rollMarginLabel = rollMarginGroup.add("statictext", boundsGen(propertyWidth), "Margó:")
                rollMarginLabel.justify = "right";
                rollMarginLabel.helpTip = "Szélső margó\nNE ÁLLÍTSD ÁT, ha nem tudod mit csinálsz!";    // this tooltip cant stop me because i cant read
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

                paperSizeGroup.add("statictext", boundsGen(13)); // spacer, magic number :D
                var lockRatioCheckbox = paperSizeGroup.add("checkbox");
                lockRatioCheckbox.helpTip = "Képarány rögzítése";
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
                    
                    var paperSizeWidthLabel = paperSizeWidthGroup.add("statictext", boundsGen(miscWidth*2), "W:")
                    paperSizeWidthLabel.justify = "right";
                    paperSizeWidthLabel.helpTip = "Szélesség";
                    var paperSizeHeightLabel = paperSizeHeightGroup.add("statictext", boundsGen(miscWidth*2), "H:")
                    paperSizeHeightLabel.justify = "right";
                    paperSizeHeightLabel.helpTip = "Magasság";


                    var paperSizeWidth = paperSizeWidthGroup.add("edittext", boundsGen(dataWidth), selectedPaperSize.width);
                    var paperSizeHeight = paperSizeHeightGroup.add("edittext", boundsGen(dataWidth), selectedPaperSize.height);
                    
                    paperSizeWidthGroup.add("statictext", boundsGen(unitWidth), "mm");
                    paperSizeHeightGroup.add("statictext", boundsGen(unitWidth), "mm");

                    paperSizeWidth.onChange = function () {
                        selectedPaperSize.width = parseHuFloat(paperSizeWidth.text);
                        if (isNaN(selectedPaperSize.width) || selectedPaperSize.width < 1) selectedPaperSize.width = 1;

                        if (fileAspectLock) selectedPaperSize.height = selectedPaperSize.width / selectedFileAspect;

                        paperSizeWidth.text = roundTo(selectedPaperSize.width, 4);
                        paperSizeHeight.text = roundTo(selectedPaperSize.height, 4);
                        preCalcGrid();
                    }
                    paperSizeHeight.onChange = function () {
                        selectedPaperSize.height = parseHuFloat(paperSizeHeight.text);
                        if (isNaN(selectedPaperSize.height) || selectedPaperSize.height < 1) selectedPaperSize.height = 1;

                        if (fileAspectLock) selectedPaperSize.width = selectedPaperSize.height * selectedFileAspect;

                        paperSizeHeight.text = roundTo(selectedPaperSize.height, 4);
                        paperSizeWidth.text = roundTo(selectedPaperSize.width, 4);
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

        var correctedQuantityLabel = quantityPanel.add("statictext", boundsGen(propertyWidth), "Korrigálás:")
        correctedQuantityLabel.justify = "right";
        correctedQuantityLabel.helpTip = "Maradék hely kitöltése extra példányokkal";
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
                var gutterLabel = gutterGroup.add("statictext", boundsGen(propertyWidth), "Köz:")
                gutterLabel.justify = "right";
                gutterLabel.helpTip = "Cellák közötti hely";
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
                var guideLabel = guideGroup.add("statictext", boundsGen(propertyWidth), "Segédvonalak:")
                guideLabel.justify = "right";
                guideLabel.helpTip = "Vágást segítő rácsvonalak";
                var guideCheckbox = guideGroup.add("checkbox", boundsGen(dataWidth));
                guideCheckbox.value = guide;
                guideCheckbox.onClick = function () {
                    guide = guideCheckbox.value;
                }
            }

            // circle mask
            var circleMaskGroup = layoutSettingsGroup.add("group");
            {
                var circleMaskLabel = circleMaskGroup.add("statictext", boundsGen(propertyWidth), "Körmaszk:")
                circleMaskLabel.justify = "right";
                circleMaskLabel.helpTip = "Cellák tartalmának kör alakúra vágása";
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

        var nothingCounter = 0;
        var dummyButton = submitGroup.add("button", undefined, "Semmi");
        dummyButton.helpTip = "És milyen igaza van!";
        dummyButton.onClick = function () {
            nothingCounter++;
            if (nothingCounter >= 10) {
                alert("Miért nem hiszel nekem?");
                nothingCounter = 0;
            }
        }

        var pngButton = submitGroup.add("button", undefined, "PNG");
        pngButton.helpTip = "Generálás és mentés PNG formátumban";
        pngButton.onClick = function () {
            if (createImage()) {
                trySaveAndClose();
                mainWindow.close();
            }
        }

        var submitButton = submitGroup.add("button", undefined, "OK");
        submitButton.onClick = function () {
            if (createImage()) mainWindow.close();
        }

        var cancelButton = submitGroup.add("button", undefined, "Mégse");
        cancelButton.onClick = function () {
            mainWindow.close();
        }

        // link buttons to enter and escape
        mainWindow.defaultElement = dummyButton;
        mainWindow.cancelElement = dummyButton;
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

function roundTo(number, digits) {
    var pow = Math.pow(10, digits);
    return Math.round(number * pow) / pow;
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