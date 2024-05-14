///#target "photoshop"



const propertyWidth = 130;
const dataWidth = 100;
const unitWidth = 70;
const height = 22;


const FileModes = {
    FILE: "Fájl",
    FOLDER: "Mappa"
};

var selectedFile = null;
var selectedFolder = null;

var mainWindow = new Window("dialog", "KBPR script - REWRITE BETA", undefined, { closeButton: true });
{
    var pathGroup, pathLabel, pathText, browseButton;
    
    mainWindow.alignChildren = "left";
    var modeSelectGroup = mainWindow.add("group");
    {
        // label
        modeSelectGroup.add("statictext", [0, 0, propertyWidth, height], "Mód:");
        
        // field
        var modeDropdown = modeSelectGroup.add("dropdownlist", [0, 0, dataWidth, height]);
        modeDropdown.add("item", FileModes.FILE);
        modeDropdown.add("item", FileModes.FOLDER);
        modeDropdown.selection = 0;

        modeDropdown.onChange = function () 
        {
            pathModeChanged(modeDropdown.selection.text);
        }
    }

    pathGroup = mainWindow.add("group");
    {
        pathLabel = pathGroup.add("statictext", [0, 0, propertyWidth, height], "Path:");
        pathText = pathGroup.add("statictext", [0, 0, 200, height]);
        pathText.justify = "right";
        browseButton = pathGroup.add("button", [0, 0, unitWidth, height], "Tallózás...");
    }

    function pathModeChanged(mode) {
        if (mode == FileModes.FILE) {
            pathLabel.text = mode + ":";
            pathText.text = selectedFile ? selectedFile.fsName : "";
            browseButton.onClick = function () 
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
            browseButton.onClick = function () 
            {
                var newFolder = Folder.selectDialog("Válassz mappát");
                if (newFolder != null) selectedFolder = newFolder;
                pathText.text = selectedFolder.fsName;
                $.writeln(selectedFolder);
            }
        }
    }
}

// initialize
modeDropdown.onChange();
mainWindow.show();