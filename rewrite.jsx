///#target "photoshop"



const propertyWidth = 130;
const dataWidth = 100;
const unitWidth = 70;
const height = 22;


const FileModes = {
    FILE: "Fájl",
    FOLDER: "Mappa"
};

const RollWidths = [610, 914, 1067];

const PaperSizes = {
    A0: "A0",
    A1: "A1",
    A2: "A2",
    A3: "A3",
    A4: "A4",
    A5: "A5",
    A6: "A6",
    A7: "A7",
    POSTER: "Nagyplakát",
    STICKER: "Körmatrica",
    OTHER: "Egyéb"
};

var selectedFile = null;
var selectedFolder = null;

var mainWindow = new Window("dialog", "KBPR script - REWRITE BETA", undefined, { closeButton: true });
{    
    mainWindow.alignChildren = "left";
    var modeSelectGroup = mainWindow.add("group");
    {
        // label
        modeSelectGroup.add("statictext", [0, 0, propertyWidth, height], "Mód:");
        
        // field
        var modeDropdown = modeSelectGroup.add("dropdownlist", [0, 0, dataWidth, height]);
        for (var mode in FileModes) modeDropdown.add("item", FileModes[mode]);
        modeDropdown.selection = 0;

        modeDropdown.onChange = function () 
        {
            pathModeChanged(modeDropdown.selection.text);
        }
    }

    var pathGroup = mainWindow.add("group");
    {
        var pathLabel = pathGroup.add("statictext", [0, 0, propertyWidth, height], "Path:");
        var pathText = pathGroup.add("statictext", [0, 0, 200, height]);
        pathText.justify = "right";
        var pathBrowseButton = pathGroup.add("button", [0, 0, unitWidth, height], "Tallózás...");
    }

    function pathModeChanged(mode) {
        if (mode == FileModes.FILE) {
            pathLabel.text = mode + ":";
            pathText.text = selectedFile ? selectedFile.fsName : "";
            pathBrowseButton.onClick = function () 
            {
                var newFile = File.openDialog("Megnyitás", "All files:*.*");
                if (newFile != null) selectedFile = newFile;
                pathText.text = selectedFile.fsName;
                $.writeln(selectedFile);
            }
        }

        else if (mode == FileModes.FOLDER) {
            pathLabel.text = mode + ":";
            pathText.text = selectedFolder ? selectedFolder.fsName : "";
            pathBrowseButton.onClick = function () 
            {
                var newFolder = Folder.selectDialog("Válassz mappát");
                if (newFolder != null) selectedFolder = newFolder;
                pathText.text = selectedFolder.fsName;
                $.writeln(selectedFolder);
            }
        }
    }

    var rollWidthGroup = mainWindow.add("group");
    {
        rollWidthGroup.add("statictext", [0, 0, propertyWidth, height], "Papírhenger szélesség:");
        var rollWidthDropdown = rollWidthGroup.add("dropdownlist", [0, 0, dataWidth, height], RollWidths);
        rollWidthDropdown.selection = 0;
        rollWidthGroup.add("statictext", [0, 0, unitWidth, height], "mm");
    }

    var paperSizeGroup = mainWindow.add("group");
    {
        paperSizeGroup.add("statictext", [0, 0, propertyWidth, height], "Papírméret:");
        var paperSizeDropdown = paperSizeGroup.add("dropdownlist", [0, 0, dataWidth, height]);
        for (var size in PaperSizes) paperSizeDropdown.add("item", PaperSizes[size]);
        paperSizeDropdown.selection = 4;
    }

    var quantityGroup = mainWindow.add("group");
    {
        quantityGroup.add("statictext", [0, 0, propertyWidth, height], "Mennyiség:");
        var quantityField = quantityGroup.add("edittext", [0, 0, dataWidth, height], "20");
        var quantityUnit = quantityGroup.add("statictext", [0, 0, unitWidth, height], "db");
    }

    var guideGroup = mainWindow.add("group");
    {
        guideGroup.add("statictext", [0, 0, propertyWidth, height], "Segítő határ:");
        var guideCheckbox = guideGroup.add("checkbox", [0, 0, dataWidth, height]);
    }

    var submitGroup = mainWindow.add("group");
    {
        submitGroup.alignment = "center";
        var submitButton = submitGroup.add("button", [0, 0, 100, height], "OK");
        submitButton.onClick = function () 
        {
            $.writeln("Submitted");
        }

        var cancelButton = submitGroup.add("button", [0, 0, 100, height], "Mégse");
        cancelButton.onClick = function () 
        {
            mainWindow.close();
        }
    }
}

// initialize
modeDropdown.onChange();
mainWindow.show();