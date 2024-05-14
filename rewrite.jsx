///#target "photoshop"



const propertyWidth = 130;
const dataWidth = 100;
const unitWidth = 70;
const height = 22;


const Modes = {
    FILE: "Fájl",
    FOLDER: "Mappa"
};

var selectedFile = null;
var selectedFolder = null;

var mainWindow = new Window("dialog", "KBPR script - REWRITE BETA", undefined, { closeButton: true });
{
    var inputGroup, filePathGroup, folderPathGroup;
    
    mainWindow.alignChildren = "left";
    var modeSelectGroup = mainWindow.add("group");
    {
        // label
        modeSelectGroup.add("statictext", [0, 0, propertyWidth, height], "Mód:");
        
        // field
        var modeDropdown = modeSelectGroup.add("dropdownlist", [0, 0, dataWidth, height]);
        modeDropdown.add("item", Modes.FILE);
        modeDropdown.add("item", Modes.FOLDER);
        modeDropdown.selection = 0;

        modeDropdown.onChange = function () 
        {
            switch (modeDropdown.selection.text)
            {
                case Modes.FILE:
                    filePathGroup.show();
                    folderPathGroup.hide();
                    break;
                case Modes.FOLDER:
                    folderPathGroup.show();
                    filePathGroup.hide();
                    break;
            }
        }
    }

    filePathGroup = mainWindow.add("group");
    {
        filePathGroup.add("statictext", [0, 0, propertyWidth, height], "Fájl:");
        var filePathText = filePathGroup.add("statictext", [0, 0, 200, height]);
        filePathText.justify = "right";
        var browseButton = filePathGroup.add("button", [0, 0, unitWidth, height], "Tallózás...");
        {
            browseButton.onClick = function () 
            {
                var newFile = File.openDialog("Megnyitás", "All files:*.*");
                if (newFile != null) selectedFile = newFile;
                filePathText.text = selectedFile.fsName;
                $.writeln(selectedFile);
            }
        }
    }

    folderPathGroup = mainWindow.add("group");
    {
        folderPathGroup.add("statictext", [0, 0, propertyWidth, height], "Mappa:");
        var folderPathText = folderPathGroup.add("statictext", [0, 0, 200, height]);
        folderPathText.justify = "right";
        var browseButton = folderPathGroup.add("button", [0, 0, unitWidth, height], "Tallózás...");
        {
            browseButton.onClick = function () 
            {
                var newFolder = Folder.selectDialog("Válassz mappát");
                if (newFolder != null) selectedFolder = newFolder;
                folderPathText.text = selectedFolder.fsName;
                $.writeln(selectedFolder);
            }
        }
    }
}


modeDropdown.onChange();
mainWindow.show();