#target "photoshop"
const scriptPath = File($.fileName).path + "/";
#include "src/presets.jsx"
#include "src/image.jsx"
#include "src/window.jsx"

// display
mainWindow.show();