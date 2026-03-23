const BACKGROUND_COLOR = [255, 220, 100];
const TEXT_COLOR = [40, 110, 100];
const BODY_TEXT_COLOR = 50;
const BUTTON_COLORS = {
  text: [255, 255, 220],
  background: [250, 150, 220],
  accent: [255, 0, 100],
  border: [205, 20, 200],
  hoverBackground: [140, 190, 200],
  hoverBorder: [150, 150, 220],
  activeBackground: [255, 50, 250],
};
const CANVAS_MIN_HEIGHT = 320;
const STORAGE_KEY = "utopiointi-writing-note";
const WES_PALETTE = {
  cream: [245, 232, 202],
  blush: [226, 168, 169],
  rose: [193, 110, 120],
  plum: [121, 73, 86],
  mustard: [218, 177, 79],
  ochre: [176, 124, 64],
  teal: [101, 142, 145],
  seafoam: [166, 194, 186],
  sky: [184, 209, 213],
  ink: [66, 56, 51],
};
const POSTER_PALETTE = {
  paper: [242, 232, 205],
  coal: [35, 33, 31],
  brick: [168, 48, 38],
  rust: [186, 91, 42],
  mustard: [214, 162, 45],
  teal: [41, 108, 118],
  steel: [123, 137, 143],
  cream: [248, 242, 224],
};
const LANGUAGE_CONTENT = {
  1: {
    titleTop: "KOSKA ?",
    titleMiddle: "MILLAINEN tulevaisuus ?",
    titleBottom: "jossa",
    mainButtonLabel: "Uusi tulevaisuus, kiitos!",
    writingLabel: "KIRJOITA OMA TULEVAISUUSMUISTIINPANOSI",
    writingPlaceholder: "Jatka syntynytta tulevaisuutta omin sanoin...",
  },
  2: {
    titleTop: "WHEN ?",
    titleMiddle: "WHAT KIND OF future ?",
    titleBottom: "where",
    mainButtonLabel: "New Future, thanks!",
    writingLabel: "WRITE YOUR OWN FUTURE NOTE",
    writingPlaceholder: "Continue the generated future in your own words...",
  },
  3: {
    titleTop: "NÄR ?",
    titleMiddle: "HURDAN ?",
    titleBottom: "Där",
    mainButtonLabel: "Ny framtid, tack!",
    writingLabel: "SKRIV DIN EGEN FRAMTIDSANTECKNING",
    writingPlaceholder: "Fortsatt den genererade framtiden med dina egna ord...",
  },
};

let result1;
let result2;
let result3;
let result4;
let result5;
let result6;
let result7;
let result8;
let result9;

let noiseArvo = 0;
let sattuma = 30;
let kieli = 1;
let fontRegular;
let fontOtsikko;
let sketchCanvas;
let button;
let buttonSavePng;
let buttonSavePdf;
let buttonSaveTxt;
let buttonFin;
let buttonEng;
let buttonSwe;
let inspirationLink;
let appShell;
let compositionShell;
let canvasShell;
let topControls;
let languageControls;
let actionControls;
let writingPanel;
let writingLabel;
let writingInput;
let currentPrompt = null;

function preload() {
  result1 = loadStrings("data/text/koska.txt");
  result2 = loadStrings("data/text/millainen.txt");
  result3 = loadStrings("data/text/mita.txt");
  result4 = loadStrings("data/text/when.txt");
  result5 = loadStrings("data/text/whatKindof.txt");
  result6 = loadStrings("data/text/what.txt");
  result7 = loadStrings("data/text/nar.txt");
  result8 = loadStrings("data/text/hurdan.txt");
  result9 = loadStrings("data/text/vad.txt");
  fontOtsikko = loadFont("assets/fonts/SEASRN__.ttf");
  fontRegular = loadFont("assets/fonts/PrestigeEliteStd-Bd.otf");
}

function setup() {
  cacheLayoutElements();
  sketchCanvas = createCanvas(100, 100);
  sketchCanvas.parent(canvasShell);
  sketchCanvas.addClass("prompt-canvas");

  buttonFin = createStyledButton("FIN", {
    parent: languageControls,
    size: [56, 44],
    className: "control-button control-button-small",
    onClick: kieliFin,
  });

  buttonEng = createStyledButton("ENG", {
    parent: languageControls,
    size: [56, 44],
    className: "control-button control-button-small",
    onClick: kieliEng,
  });

  buttonSwe = createStyledButton("SWE", {
    parent: languageControls,
    size: [56, 44],
    className: "control-button control-button-small",
    onClick: kieliSwe,
  });

  buttonSavePng = createStyledButton("SAVE PNG", {
    parent: actionControls,
    size: [160, 44],
    className: "control-button",
    onClick: saveAsImage,
  });

  buttonSavePdf = createStyledButton("SAVE PDF", {
    parent: actionControls,
    size: [160, 44],
    className: "control-button",
    onClick: saveAsPdf,
  });

  buttonSaveTxt = createStyledButton("SAVE TEXT", {
    parent: actionControls,
    size: [160, 44],
    className: "control-button",
    onClick: saveAsText,
  });

  button = createStyledButton("?", {
    parent: actionControls,
    size: [220, 64],
    className: "control-button control-button-primary",
    onClick: tuleva,
  });

  inspirationLink = createA(
    "https://shop.aalto.fi/p/1647-erinomaisen-jouheva/",
    "Inspiration: Erinomaisen Jouheva-kuvataidekasvatuksen sanakirja",
    "_blank"
  );
  inspirationLink.parent(topControls);
  inspirationLink.addClass("prompt-link");

  updateLanguageButtons();
  updateMainButtonLabel();
  updateWritingUI();
  restoreSavedWriting();
  bindWritingPersistence();
  updateLayout();
}

function draw() {
  renderScene();
}

function cacheLayoutElements() {
  appShell = select("#app-shell");
  compositionShell = select("#composition-shell");
  canvasShell = select("#canvas-shell");
  topControls = select("#top-controls");
  languageControls = select("#language-controls");
  actionControls = select("#action-controls");
  writingPanel = select(".writing-panel");
  writingLabel = select("#writing-label");
  writingInput = select("#writing-input");
}

function createStyledButton(label, options) {
  const buttonElement = createButton(label);

  buttonElement.parent(options.parent);
  buttonElement.mouseClicked(options.onClick);
  buttonElement.size(options.size[0], options.size[1]);
  buttonElement.addClass(options.className);
  buttonElement.attribute("type", "button");
  applyButtonStyle(buttonElement);
  setButtonDefaultState(buttonElement);
  buttonElement.mouseOver(() => handleButtonHover(buttonElement));
  buttonElement.mouseOut(() => handleButtonMouseOut(buttonElement));

  return buttonElement;
}

function applyButtonStyle(buttonElement) {
  buttonElement.style("font-family", "Futura, sans-serif");
  buttonElement.style("color", color(...BUTTON_COLORS.text));
  buttonElement.style("active-color", color(...BUTTON_COLORS.accent));
  buttonElement.style("background-color", color(...BUTTON_COLORS.background));
  buttonElement.style("border-color", color(...BUTTON_COLORS.border));
}

function handleButtonHover(buttonElement) {
  if (isActiveLanguageButton(buttonElement)) {
    setButtonActiveState(buttonElement);
    return;
  }

  setButtonHoverState(buttonElement);
}

function handleButtonMouseOut(buttonElement) {
  if (isActiveLanguageButton(buttonElement)) {
    setButtonActiveState(buttonElement);
    return;
  }

  setButtonDefaultState(buttonElement);
}

function isActiveLanguageButton(buttonElement) {
  return (
    (buttonElement === buttonFin && kieli === 1) ||
    (buttonElement === buttonEng && kieli === 2) ||
    (buttonElement === buttonSwe && kieli === 3)
  );
}

function setButtonHoverState(buttonElement) {
  buttonElement.style("background-color", color(...BUTTON_COLORS.hoverBackground));
  buttonElement.style("border-color", color(...BUTTON_COLORS.hoverBorder));
}

function setButtonDefaultState(buttonElement) {
  buttonElement.style("background-color", color(...BUTTON_COLORS.background));
  buttonElement.style("border-color", color(...BUTTON_COLORS.border));
}

function setButtonActiveState(buttonElement) {
  buttonElement.style("background-color", color(...BUTTON_COLORS.activeBackground));
  buttonElement.style("border-color", color(...BUTTON_COLORS.hoverBorder));
}

function renderScene() {
  background(...BACKGROUND_COLOR);
  drawBackdropWash();

  if (sattuma > 93) {
    drawConfettiScene();
  } else if (sattuma < 2) {
    drawNoiseRectScene();
  } else if (sattuma < 7) {
    drawNoiseEllipseScene();
  }

  if (currentPrompt) {
    drawPromptResults();
  } else if (sattuma <= 93 && sattuma >= 7) {
    drawLanguagePrompt();
  }
}

function drawBackdropWash() {
  const time = frameCount * 0.01;
  const centerX = width * (0.5 + sin(time * 0.35) * 0.08);
  const centerY = height * (0.34 + cos(time * 0.27) * 0.05);
  const maxRadius = max(width, height) * 0.9;

  noStroke();

  for (let i = 9; i >= 1; i -= 1) {
    const ratio = i / 9;
    const alpha = map(i, 9, 1, 10, 42);
    const washColor = lerpPaletteColor(WES_PALETTE.cream, WES_PALETTE.sky, 1 - ratio);
    fill(washColor[0], washColor[1], washColor[2], alpha);
    ellipse(centerX, centerY, maxRadius * ratio, maxRadius * ratio * 0.8);
  }

  stroke(WES_PALETTE.plum[0], WES_PALETTE.plum[1], WES_PALETTE.plum[2], 24);
  strokeWeight(2);
  noFill();
  rect(width * 0.045, height * 0.055, width * 0.91, height * 0.89, 24);
}

function drawConfettiScene() {
  const time = frameCount * 0.012;
  const unit = min(width, height);

  noStroke();
  fill(POSTER_PALETTE.paper[0], POSTER_PALETTE.paper[1], POSTER_PALETTE.paper[2], 150);
  rect(width * 0.08, height * 0.1, width * 0.84, height * 0.78, 28);

  push();
  translate(width * 0.29, height * 0.34);
  rotate(time * 0.9);
  fill(POSTER_PALETTE.brick[0], POSTER_PALETTE.brick[1], POSTER_PALETTE.brick[2], 228);
  rectMode(CENTER);
  rect(0, 0, unit * 0.5, unit * 0.5);
  fill(POSTER_PALETTE.mustard[0], POSTER_PALETTE.mustard[1], POSTER_PALETTE.mustard[2], 220);
  ellipse(0, 0, unit * 0.22, unit * 0.22);
  pop();

  push();
  translate(width * 0.72, height * 0.63);
  rotate(-time * 0.75);
  fill(POSTER_PALETTE.teal[0], POSTER_PALETTE.teal[1], POSTER_PALETTE.teal[2], 230);
  rectMode(CENTER);
  rect(0, 0, unit * 0.42, unit * 0.42);
  fill(POSTER_PALETTE.paper[0], POSTER_PALETTE.paper[1], POSTER_PALETTE.paper[2], 245);
  rect(0, 0, unit * 0.16, unit * 0.16);
  pop();

  stroke(POSTER_PALETTE.coal[0], POSTER_PALETTE.coal[1], POSTER_PALETTE.coal[2], 180);
  strokeWeight(max(unit * 0.012, 4));
  line(width * 0.08, height * 0.82, width * 0.92, height * 0.18);
  line(width * 0.18, height * 0.1, width * 0.84, height * 0.9);

  noStroke();
  for (let i = 0; i < 6; i += 1) {
    const bandX = width * (0.14 + i * 0.12);
    const bandHeight = height * map(sin(time * 2 + i * 0.7), -1, 1, 0.18, 0.5);
    fill(POSTER_PALETTE.rust[0], POSTER_PALETTE.rust[1], POSTER_PALETTE.rust[2], 185);
    rect(bandX, height * 0.78 - bandHeight, width * 0.055, bandHeight);
  }

  rectMode(CORNER);
}

function drawNoiseRectScene() {
  const time = frameCount * 0.01;
  const unit = min(width, height);

  noStroke();
  fill(POSTER_PALETTE.paper[0], POSTER_PALETTE.paper[1], POSTER_PALETTE.paper[2], 120);
  rect(width * 0.06, height * 0.08, width * 0.88, height * 0.84, 20);

  fill(POSTER_PALETTE.coal[0], POSTER_PALETTE.coal[1], POSTER_PALETTE.coal[2], 220);
  rect(0, height * 0.18, width, height * 0.1);
  rect(0, height * 0.72, width, height * 0.08);

  for (let i = 0; i < 5; i += 1) {
    const slide = noise(noiseArvo + i * 0.2, time * 0.3) * width * 0.16;
    fill(POSTER_PALETTE.brick[0], POSTER_PALETTE.brick[1], POSTER_PALETTE.brick[2], 215);
    rect(width * (0.08 + i * 0.16) + slide, height * 0.26, width * 0.12, height * 0.48);
    fill(POSTER_PALETTE.mustard[0], POSTER_PALETTE.mustard[1], POSTER_PALETTE.mustard[2], 205);
    rect(width * (0.11 + i * 0.16) - slide * 0.22, height * 0.34, width * 0.05, height * 0.28);
  }

  stroke(POSTER_PALETTE.steel[0], POSTER_PALETTE.steel[1], POSTER_PALETTE.steel[2], 170);
  strokeWeight(max(unit * 0.008, 3));
  for (let i = -2; i < 10; i += 1) {
    const shift = sin(time * 1.6 + i * 0.4) * width * 0.04;
    line(width * (i * 0.12) + shift, 0, width * (i * 0.12) + width * 0.24 + shift, height);
  }

  noStroke();
  fill(POSTER_PALETTE.teal[0], POSTER_PALETTE.teal[1], POSTER_PALETTE.teal[2], 220);
  rect(width * 0.58, height * 0.08, width * 0.28, height * 0.16);
  fill(POSTER_PALETTE.paper[0], POSTER_PALETTE.paper[1], POSTER_PALETTE.paper[2], 240);
  rect(width * 0.62, height * 0.12, width * 0.08, height * 0.08);

  noiseArvo += 0.004;
}

function drawNoiseEllipseScene() {
  const time = frameCount * 0.009;
  const unit = min(width, height);
  const centerX = width * (0.52 + sin(time * 0.4) * 0.03);
  const centerY = height * 0.5;

  noStroke();
  fill(POSTER_PALETTE.paper[0], POSTER_PALETTE.paper[1], POSTER_PALETTE.paper[2], 128);
  ellipse(centerX, centerY, unit * 0.95, unit * 0.95);

  stroke(POSTER_PALETTE.coal[0], POSTER_PALETTE.coal[1], POSTER_PALETTE.coal[2], 215);
  strokeWeight(max(unit * 0.016, 6));
  noFill();
  ellipse(centerX, centerY, unit * 0.82, unit * 0.82);
  ellipse(centerX, centerY, unit * 0.54, unit * 0.54);

  noStroke();
  fill(POSTER_PALETTE.brick[0], POSTER_PALETTE.brick[1], POSTER_PALETTE.brick[2], 232);
  arc(centerX, centerY, unit * 0.94, unit * 0.94, -HALF_PI + time, 0.15 + time, PIE);
  fill(POSTER_PALETTE.mustard[0], POSTER_PALETTE.mustard[1], POSTER_PALETTE.mustard[2], 225);
  arc(centerX, centerY, unit * 0.6, unit * 0.6, HALF_PI + time * 0.7, PI + time * 0.7, PIE);
  fill(POSTER_PALETTE.teal[0], POSTER_PALETTE.teal[1], POSTER_PALETTE.teal[2], 216);
  ellipse(centerX + cos(time * 1.5) * unit * 0.18, centerY + sin(time * 1.2) * unit * 0.1, unit * 0.18, unit * 0.18);

  stroke(POSTER_PALETTE.coal[0], POSTER_PALETTE.coal[1], POSTER_PALETTE.coal[2], 180);
  strokeWeight(max(unit * 0.01, 4));
  line(width * 0.1, height * 0.22, width * 0.9, height * 0.22);
  line(width * 0.18, height * 0.78, width * 0.82, height * 0.78);
  line(centerX, height * 0.12, centerX, height * 0.88);

  noiseArvo += 0.002;
}

function getPaletteCycle(value) {
  const palette = [
    WES_PALETTE.blush,
    WES_PALETTE.rose,
    WES_PALETTE.mustard,
    WES_PALETTE.ochre,
    WES_PALETTE.teal,
    WES_PALETTE.seafoam,
    WES_PALETTE.sky,
  ];
  const baseIndex = floor(abs(value)) % palette.length;
  const nextIndex = (baseIndex + 1) % palette.length;
  const amt = abs(value) % 1;

  return lerpPaletteColor(palette[baseIndex], palette[nextIndex], amt);
}

function lerpPaletteColor(colorA, colorB, amount) {
  return [
    lerp(colorA[0], colorB[0], amount),
    lerp(colorA[1], colorB[1], amount),
    lerp(colorA[2], colorB[2], amount),
  ];
}

function drawLanguagePrompt() {
  const languageContent = LANGUAGE_CONTENT[kieli];
  const metrics = getTextMetrics();

  fill(...TEXT_COLOR);
  noStroke();
  textFont(fontOtsikko);
  textAlign(CENTER, CENTER);
  textSize(metrics.headingSize);
  text(languageContent.titleTop, width / 2, metrics.headingTopY);
  text(languageContent.titleMiddle, width / 2, metrics.headingMiddleY);
  text(languageContent.titleBottom, width / 2, metrics.headingBottomY);
}

function drawPromptResults() {
  const metrics = getTextMetrics();
  const textBoxX = width * 0.12;
  const textBoxWidth = width * 0.76;
  const textBoxHeight = metrics.promptBoxHeight;

  drawLanguagePrompt();

  fill(BODY_TEXT_COLOR);
  noStroke();
  textFont(fontRegular);
  textAlign(CENTER, TOP);
  textSize(metrics.promptSize);
  text(currentPrompt.when, textBoxX, metrics.resultTopY, textBoxWidth, textBoxHeight);
  text(currentPrompt.kind, textBoxX, metrics.resultMiddleY, textBoxWidth, textBoxHeight);
  text(currentPrompt.what, textBoxX, metrics.resultBottomY, textBoxWidth, textBoxHeight);
}

function getTextMetrics() {
  const shortSide = min(width, height);
  const isNarrow = width < 520;
  const isLandscapePhone = width > height && width < 900;
  const headingSize = constrain(shortSide * (isNarrow ? 0.094 : 0.08), 28, 64);
  const promptSize = constrain(shortSide * (isNarrow ? 0.052 : 0.042), 18, 34);
  const topInset = height * (isLandscapePhone ? 0.08 : 0.1);
  const availableHeight = height * (isLandscapePhone ? 0.72 : 0.76);
  const headingTopY = topInset + availableHeight * 0.12;
  const headingMiddleY = topInset + availableHeight * 0.42;
  const headingBottomY = topInset + availableHeight * 0.74;
  const resultTopY = headingTopY + constrain(headingSize * 0.85, 28, 54);
  const resultMiddleY = headingMiddleY + constrain(headingSize * 0.95, 34, 62);
  const resultBottomY = headingBottomY + constrain(headingSize * 0.8, 28, 52);

  return {
    headingSize,
    promptSize,
    headingTopY,
    headingMiddleY,
    headingBottomY,
    resultTopY,
    resultMiddleY,
    resultBottomY,
    promptBoxHeight: max(headingSize * 1.9, 52),
  };
}

function tuleva() {
  const resultSets = {
    1: [result1, result2, result3],
    2: [result4, result5, result6],
    3: [result7, result8, result9],
  };
  const [whenOptions, kindOptions, whatOptions] = resultSets[kieli];

  currentPrompt = {
    when: random(whenOptions),
    kind: random(kindOptions),
    what: random(whatOptions),
  };
  sattuma = int(random(100));
  updateWritingUI();
  renderScene();
}

function kieliFin() {
  kieli = 1;
  currentPrompt = null;
  updateLanguageButtons();
  updateMainButtonLabel();
  updateWritingUI();
  renderScene();
}

function kieliEng() {
  kieli = 2;
  currentPrompt = null;
  updateLanguageButtons();
  updateMainButtonLabel();
  updateWritingUI();
  renderScene();
}

function kieliSwe() {
  kieli = 3;
  currentPrompt = null;
  updateLanguageButtons();
  updateMainButtonLabel();
  updateWritingUI();
  renderScene();
}

function updateLanguageButtons() {
  const languageButtons = [
    { element: buttonFin, language: 1 },
    { element: buttonEng, language: 2 },
    { element: buttonSwe, language: 3 },
  ];

  languageButtons.forEach(({ element, language }) => {
    if (language === kieli) {
      setButtonActiveState(element);
    } else {
      setButtonDefaultState(element);
    }
  });
}

function updateMainButtonLabel() {
  button.html(LANGUAGE_CONTENT[kieli].mainButtonLabel);
}

function updateWritingUI() {
  const languageContent = LANGUAGE_CONTENT[kieli];

  writingLabel.html(languageContent.writingLabel);
  writingInput.attribute("placeholder", languageContent.writingPlaceholder);
}

function bindWritingPersistence() {
  writingInput.input(() => {
    persistWriting();
  });
}

function persistWriting() {
  localStorage.setItem(STORAGE_KEY, writingInput.value());
}

function restoreSavedWriting() {
  const savedWriting = localStorage.getItem(STORAGE_KEY);

  if (savedWriting) {
    writingInput.value(savedWriting);
  }
}

function getExportText() {
  const languageContent = LANGUAGE_CONTENT[kieli];
  const promptLines = currentPrompt
    ? [currentPrompt.when, currentPrompt.kind, currentPrompt.what]
    : [languageContent.titleTop, languageContent.titleMiddle, languageContent.titleBottom];
  const noteText = writingInput.value().trim();

  return [
    promptLines.join("\n"),
    "",
    languageContent.writingLabel,
    noteText || writingInput.attribute("placeholder"),
  ].join("\n");
}

async function captureComposition() {
  return html2canvas(compositionShell.elt, {
    backgroundColor: null,
    scale: min(window.devicePixelRatio || 1, 2),
    useCORS: true,
  });
}

async function saveAsImage() {
  const captureCanvas = await captureComposition();
  const imageUrl = captureCanvas.toDataURL("image/png");

  downloadUrl(imageUrl, "FuturePrompt.png");
}

async function saveAsPdf() {
  const captureCanvas = await captureComposition();
  const imageUrl = captureCanvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: captureCanvas.width >= captureCanvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [captureCanvas.width, captureCanvas.height],
  });

  pdf.addImage(imageUrl, "PNG", 0, 0, captureCanvas.width, captureCanvas.height);
  pdf.save("FuturePrompt.pdf");
}

function saveAsText() {
  const textBlob = new Blob([getExportText()], { type: "text/plain;charset=utf-8" });
  const textUrl = URL.createObjectURL(textBlob);

  downloadUrl(textUrl, "FuturePrompt.txt");
  setTimeout(() => URL.revokeObjectURL(textUrl), 0);
}

function downloadUrl(url, filename) {
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function windowResized() {
  updateLayout();
  renderScene();
}

function updateLayout() {
  const shellWidth = canvasShell.elt.clientWidth;
  const shellHeight = max(canvasShell.elt.clientHeight, CANVAS_MIN_HEIGHT);

  resizeCanvas(shellWidth, shellHeight);

  if (shellWidth < 540) {
    button.size(max(shellWidth - 24, 220), 58);
    button.style("font-size", shellWidth < 420 ? "17px" : "18px");
    [buttonSavePng, buttonSavePdf, buttonSaveTxt].forEach((exportButton) => {
      exportButton.size(max(shellWidth - 24, 220), 48);
      exportButton.style("font-size", "13px");
    });
    [buttonFin, buttonEng, buttonSwe].forEach((languageButton) => {
      languageButton.size(max((shellWidth - 44) / 3, 72), 50);
      languageButton.style("font-size", "13px");
    });
    return;
  }

  button.size(min(320, shellWidth * 0.4), 64);
  button.style("font-size", "20px");
  [buttonSavePng, buttonSavePdf, buttonSaveTxt].forEach((exportButton) => {
    exportButton.size(160, 46);
    exportButton.style("font-size", "12px");
  });
  [buttonFin, buttonEng, buttonSwe].forEach((languageButton) => {
    languageButton.size(56, 44);
    languageButton.style("font-size", "12px");
  });
}
