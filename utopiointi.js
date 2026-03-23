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
  const time = frameCount * 0.018;
  const columns = 8;
  const rows = 5;
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const burst = map(sin(time * 0.7), -1, 1, 0.75, 1.25);

  rectMode(CENTER);
  ellipseMode(CENTER);

  for (let gx = 0; gx < columns; gx += 1) {
    for (let gy = 0; gy < rows; gy += 1) {
      const centerX = cellWidth * (gx + 0.5);
      const centerY = cellHeight * (gy + 0.5);
      const localTime = time + gx * 0.35 + gy * 0.22;
      const orbit = min(cellWidth, cellHeight) * 0.2 * burst;
      const dotX = centerX + cos(localTime * 1.6) * orbit;
      const dotY = centerY + sin(localTime * 1.2) * orbit * 0.7;
      const petalColor = getPaletteCycle(localTime * 0.55 + (gx + gy) * 0.18);
      const accentColor = getPaletteCycle(localTime * 0.55 + 1.7);

      noStroke();
      fill(WES_PALETTE.cream[0], WES_PALETTE.cream[1], WES_PALETTE.cream[2], 30);
      ellipse(centerX, centerY, cellWidth * 0.58, cellHeight * 0.5);

      push();
      translate(dotX, dotY);
      rotate(localTime);
      fill(petalColor[0], petalColor[1], petalColor[2], 178);
      rect(0, 0, cellWidth * 0.18, cellHeight * 0.1, 12);
      fill(accentColor[0], accentColor[1], accentColor[2], 220);
      ellipse(0, 0, cellWidth * 0.11, cellWidth * 0.11);
      pop();

      stroke(WES_PALETTE.plum[0], WES_PALETTE.plum[1], WES_PALETTE.plum[2], 36);
      strokeWeight(1);
      line(centerX, centerY, dotX, dotY);
    }
  }

  rectMode(CORNER);
}

function drawNoiseRectScene() {
  const time = frameCount * 0.012;
  const stripeCount = 14;
  const bandHeight = height / stripeCount;

  noStroke();

  for (let i = 0; i < stripeCount; i += 1) {
    const y = i * bandHeight;
    const offset = noise(noiseArvo + i * 0.12, time * 0.4) * width * 0.22;
    const bandColor = getPaletteCycle(i * 0.33 + time * 0.4);
    fill(bandColor[0], bandColor[1], bandColor[2], 62);
    rect(-width * 0.1 + offset, y, width * 1.2, bandHeight * 0.9);
  }

  for (let i = 0; i < 28; i += 1) {
    const n = noise(noiseArvo + i * 0.09, time * 0.23);
    const x = width * n;
    const y = (height / 27) * i + sin(time + i) * 12;
    const tileWidth = map(noise(noiseArvo + i * 0.17, time * 0.6), 0, 1, width * 0.08, width * 0.22);
    const tileHeight = bandHeight * map(sin(time * 1.3 + i * 0.4), -1, 1, 0.42, 1.4);
    const tileColor = getPaletteCycle(time * 0.8 + i * 0.21 + 0.7);

    fill(tileColor[0], tileColor[1], tileColor[2], 186);
    rect(x - tileWidth / 2, y, tileWidth, tileHeight, 6);

    stroke(WES_PALETTE.ink[0], WES_PALETTE.ink[1], WES_PALETTE.ink[2], 55);
    strokeWeight(1);
    line(x - tileWidth / 2, y + tileHeight / 2, x + tileWidth / 2, y + tileHeight / 2);
  }

  noFill();
  stroke(WES_PALETTE.cream[0], WES_PALETTE.cream[1], WES_PALETTE.cream[2], 100);
  strokeWeight(2);

  beginShape();
  for (let x = 0; x <= width; x += width / 24) {
    const y = height * 0.5 + sin(time * 1.4 + x * 0.02) * height * 0.08;
    curveVertex(x, y);
  }
  endShape();

  noiseArvo += 0.006;
}

function drawNoiseEllipseScene() {
  const time = frameCount * 0.01;
  const centerX = width * (0.5 + sin(time * 0.45) * 0.06);
  const centerY = height * (0.52 + cos(time * 0.32) * 0.04);
  const ringCount = 7;
  const maxSize = min(width, height) * 0.62;

  noFill();

  for (let i = 0; i < ringCount; i += 1) {
    const ratio = i / (ringCount - 1);
    const wobble = noise(noiseArvo + i * 0.21, time * 0.45);
    const ringWidth = maxSize * (1 - ratio * 0.11);
    const ringHeight = ringWidth * map(wobble, 0, 1, 0.68, 0.9);
    const ringColor = getPaletteCycle(time * 0.65 + i * 0.38);

    stroke(ringColor[0], ringColor[1], ringColor[2], 155 - i * 14);
    strokeWeight(map(i, 0, ringCount - 1, 4.2, 1.4));
    ellipse(
      centerX + sin(time * 1.2 + i) * width * 0.018,
      centerY + cos(time * 1.1 + i * 0.7) * height * 0.02,
      ringWidth,
      ringHeight
    );
  }

  const orbitCount = 10;
  for (let i = 0; i < orbitCount; i += 1) {
    const orbitTime = time * (0.8 + i * 0.05);
    const radiusX = maxSize * (0.22 + i * 0.033);
    const radiusY = radiusX * 0.54;
    const x = centerX + cos(orbitTime + i * 0.7) * radiusX;
    const y = centerY + sin(orbitTime * 1.2 + i * 0.5) * radiusY;
    const satelliteColor = getPaletteCycle(orbitTime + i * 0.28 + 2.1);

    noStroke();
    fill(satelliteColor[0], satelliteColor[1], satelliteColor[2], 210);
    ellipse(x, y, maxSize * 0.04, maxSize * 0.04);
    fill(WES_PALETTE.cream[0], WES_PALETTE.cream[1], WES_PALETTE.cream[2], 120);
    ellipse(x, y, maxSize * 0.018, maxSize * 0.018);
  }

  stroke(WES_PALETTE.plum[0], WES_PALETTE.plum[1], WES_PALETTE.plum[2], 32);
  strokeWeight(1);
  for (let i = 0; i < 12; i += 1) {
    const angle = (TWO_PI / 12) * i + time * 0.2;
    line(
      centerX + cos(angle) * maxSize * 0.12,
      centerY + sin(angle) * maxSize * 0.08,
      centerX + cos(angle) * maxSize * 0.38,
      centerY + sin(angle) * maxSize * 0.25
    );
  }

  noiseArvo += 0.003;
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
  const textBoxX = width * 0.09;
  const textBoxWidth = width * 0.82;
  const textBoxHeight = metrics.promptBoxHeight;

  drawLanguagePrompt();

  fill(BODY_TEXT_COLOR);
  noStroke();
  textFont(fontRegular);
  textAlign(CENTER, CENTER);
  textSize(metrics.promptSize);
  text(currentPrompt.when, textBoxX, metrics.promptTopY, textBoxWidth, textBoxHeight);
  text(currentPrompt.kind, textBoxX, metrics.promptMiddleY, textBoxWidth, textBoxHeight);
  text(currentPrompt.what, textBoxX, metrics.promptBottomY, textBoxWidth, textBoxHeight);
}

function getTextMetrics() {
  const shortSide = min(width, height);
  const isNarrow = width < 520;
  const isLandscapePhone = width > height && width < 900;
  const promptArea = getPromptAreaBounds(isLandscapePhone);
  const promptAreaHeight = promptArea.bottom - promptArea.top;

  return {
    headingSize: constrain(shortSide * (isNarrow ? 0.094 : 0.08), 28, 64),
    promptSize: constrain(shortSide * (isNarrow ? 0.052 : 0.042), 18, 34),
    headingTopY: promptArea.top + promptAreaHeight * 0.1,
    headingMiddleY: promptArea.top + promptAreaHeight * 0.34,
    headingBottomY: promptArea.top + promptAreaHeight * 0.58,
    promptTopY: promptArea.top + promptAreaHeight * 0.2,
    promptMiddleY: promptArea.top + promptAreaHeight * 0.46,
    promptBottomY: promptArea.top + promptAreaHeight * 0.72,
    promptBoxHeight: max(promptAreaHeight * 0.13, 42),
  };
}

function getPromptAreaBounds(isLandscapePhone) {
  const topPadding = height * (isLandscapePhone ? 0.1 : 0.12);
  const defaultBottom = height * (isLandscapePhone ? 0.62 : 0.68);

  if (!writingPanel) {
    return { top: topPadding, bottom: defaultBottom };
  }

  const panelTop = writingPanel.elt.offsetTop;
  const reservedGap = height * (isLandscapePhone ? 0.08 : 0.07);
  const bottom = constrain(panelTop - reservedGap, height * 0.42, defaultBottom);

  return { top: topPadding, bottom };
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
  const contextualPlaceholder = currentPrompt
    ? `${languageContent.writingPlaceholder}\n\n${currentPrompt.when}\n${currentPrompt.kind}\n${currentPrompt.what}`
    : languageContent.writingPlaceholder;

  writingLabel.html(languageContent.writingLabel);
  writingInput.attribute("placeholder", contextualPlaceholder);
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
  return html2canvas(canvasShell.elt, {
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
