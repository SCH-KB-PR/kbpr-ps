const fileName = "KBPR";

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
    POSTER: { name: "Nagyplakát", width: 914, height: 1600 },
    STICKER70: { name: "Körmatrica 70mm", width: 72, height: 72 },
    STICKER49: { name: "Körmatrica 49mm", width: 51, height: 51 },
    BADGE: { name: "Kitűző", width: 72, height: 72 },
    OTHER: { name: "Egyéb...", width: 100, height: 100 }
};
const PaperSizesArray = getValues(PaperSizes); // i despise this language

const ResolutionArray = [300, 600];

// setting variables
var fileAspectLock = true;                  // aspect ratio lock is enabled by default
var selectedFileAspect = 1;                 // width / height, 1 by default
var selectedFile = null;                    // selected file, null by default
var selectedFolder = null;                  // selected folder, null by default
var selectedFileList = [null];              // list of files in the selected folder
var multiFileMode = false;                  // multi file mode disabled by default
var selectedRollWidth = RollWidthsArray[0]; // default roll width = 610
var selectedPaperSize = PaperSizes.A4;      // default paper size = A4
var quantityMultiplier = 20;                // default quantity multiplier
var quantityCorrectionEnabled = false;      // quantity correction disabled by default
var gutter = 2;                             // default gutter = 2 mm
var guide = true;                           // guide is enabled by default
var circleMask = false;                     // circle mask is disabled by default
var ppi = ResolutionArray[0];               // default resolution = 300 dpi

// plotter dependent settings
// dont touch unless you know what you are doing
var margin = 3;                             // default margin = 3 mm
const safetyMargin = 3;                     // default bottom safety margin = 3 mm
const maxDocumentHeight = 18000;            // 18 meters (as if photoshop could handle that lmao)
const minDocumentHeight = 101.6;            // 101.6 mm = 4 inches