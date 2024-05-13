var propertyWidth = 130;
var dataWidth = 100;
var unitWidth = 70;
var height = 22;


var MainWindow = new Window('dialog', 'KBPR script', undefined, { closeButton: true });
{
    var group = MainWindow.add('group');
    {
        group.orientation = "column";
        group.alignChildren = "left";
        fileField = group.add("group");
        {
            fileField.add("statictext", [0, 0, propertyWidth, height], "Fájl:");
        }
        var browseButton = fileField.add('button', [0, 0, unitWidth, height], 'Keresés');{
            browseButton.onClick = function ()
            { 
                SecondWindow.show(); 
            }
        }
    }
}
MainWindow.show();
