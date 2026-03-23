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
const STORAGE_KEY = "utopiointi-writing-note-v2";
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
const NIGHT_PALETTE = {
  black: [8, 10, 18],
  navy: [18, 24, 46],
  indigo: [52, 46, 92],
  violet: [111, 88, 164],
  cyan: [105, 198, 214],
  glow: [228, 241, 255],
};
const PASTEL_PALETTE = {
  shell: [248, 240, 235],
  peach: [245, 207, 192],
  lavender: [214, 201, 244],
  mint: [198, 233, 224],
  sky: [196, 226, 243],
  rose: [239, 190, 214],
  gold: [232, 211, 156],
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
  const time = frameCount * 0.01;
  const unit = min(width, height);
  const phase = map(sin(time * 0.45), -1, 1, 0, 1);
  const accentA = lerpPaletteColor(POSTER_PALETTE.brick, POSTER_PALETTE.mustard, phase);
  const accentB = lerpPaletteColor(POSTER_PALETTE.teal, POSTER_PALETTE.rust, 1 - phase);
  const paperTone = lerpPaletteColor(POSTER_PALETTE.paper, POSTER_PALETTE.cream, phase);

  noStroke();
  fill(paperTone[0], paperTone[1], paperTone[2], 165);
  rect(width * 0.05, height * 0.07, width * 0.9, height * 0.82, 30);

  push();
  translate(width * (0.26 + sin(time * 0.4) * 0.08), height * (0.3 + cos(time * 0.5) * 0.06));
  rotate(time * 1.2);
  fill(accentA[0], accentA[1], accentA[2], 232);
  rectMode(CENTER);
  rect(0, 0, unit * (0.44 + phase * 0.22), unit * (0.44 + phase * 0.22));
  fill(POSTER_PALETTE.coal[0], POSTER_PALETTE.coal[1], POSTER_PALETTE.coal[2], 225);
  ellipse(0, 0, unit * (0.16 + phase * 0.18), unit * (0.16 + phase * 0.18));
  pop();

  push();
  translate(width * (0.72 + cos(time * 0.38) * 0.07), height * (0.62 + sin(time * 0.52) * 0.07));
  rotate(-time * 0.95);
  fill(accentB[0], accentB[1], accentB[2], 235);
  rectMode(CENTER);
  rect(0, 0, unit * (0.36 + (1 - phase) * 0.24), unit * (0.36 + (1 - phase) * 0.24));
  fill(paperTone[0], paperTone[1], paperTone[2], 248);
  rect(0, 0, unit * 0.16, unit * (0.16 + phase * 0.16));
  pop();

  stroke(POSTER_PALETTE.coal[0], POSTER_PALETTE.coal[1], POSTER_PALETTE.coal[2], 190);
  strokeWeight(max(unit * 0.016, 5));
  line(width * 0.04, height * (0.86 - phase * 0.08), width * 0.96, height * (0.14 + phase * 0.08));
  line(width * (0.16 + phase * 0.06), height * 0.06, width * (0.86 - phase * 0.06), height * 0.94);

  push();
  translate(width * 0.5, height * 0.48);
  rotate(-PI / 7 + sin(time * 0.7) * 0.22);
  fill(POSTER_PALETTE.coal[0], POSTER_PALETTE.coal[1], POSTER_PALETTE.coal[2], 224);
  rectMode(CENTER);
  rect(0, 0, unit * (0.1 + phase * 0.08), unit * (0.82 + sin(time * 0.5) * 0.26));
  fill(accentA[0], accentA[1], accentA[2], 230);
  rect(0, -unit * 0.16, unit * (0.36 + phase * 0.22), unit * 0.1);
  fill(accentB[0], accentB[1], accentB[2], 215);
  rect(0, unit * 0.18, unit * (0.24 + (1 - phase) * 0.24), unit * 0.08);
  pop();

  noStroke();
  for (let i = 0; i < 8; i += 1) {
    const bandX = width * (0.08 + i * 0.1);
    const bandHeight = height * map(sin(time * 1.9 + i * 0.85), -1, 1, 0.12, 0.64);
    const bandColor = i % 2 === 0 ? accentA : accentB;
    fill(bandColor[0], bandColor[1], bandColor[2], 188);
    rect(bandX, height * 0.88 - bandHeight, width * 0.062, bandHeight);
  }

  rectMode(CORNER);
  ellipseMode(CENTER);
}

function drawNoiseRectScene() {
  const time = frameCount * 0.014;
  const unit = min(width, height);
  const layers = 58;
  const colorPhase = map(sin(time * 0.28), -1, 1, 0, 1);
  const bgColor = lerpPaletteColor(NIGHT_PALETTE.black, NIGHT_PALETTE.navy, colorPhase);
  const lineStart = lerpPaletteColor(NIGHT_PALETTE.cyan, NIGHT_PALETTE.glow, colorPhase);
  const lineEnd = lerpPaletteColor(NIGHT_PALETTE.violet, NIGHT_PALETTE.indigo, 1 - colorPhase);

  noStroke();
  fill(bgColor[0], bgColor[1], bgColor[2], 236);
  rect(0, 0, width, height);

  for (let i = 0; i < 16; i += 1) {
    const glowX = width * noise(90 + i, time * 0.18);
    const glowY = height * noise(120 + i, time * 0.14);
    const glowSize = unit * map(noise(150 + i, time * 0.24), 0, 1, 0.14, 0.42);
    const glowColor = i % 2 === 0 ? NIGHT_PALETTE.indigo : NIGHT_PALETTE.violet;
    fill(glowColor[0], glowColor[1], glowColor[2], 24);
    ellipse(glowX, glowY, glowSize, glowSize);
  }

  push();
  translate(width * 0.5, height * 0.54);
  for (let i = 0; i < layers; i += 1) {
    const t = i / layers;
    const radius = unit * (0.08 + t * 0.58);
    const spin = time * 2.4 + t * TWO_PI * 1.25;
    const wave = sin(time * 1.6 + i * 0.42) * unit * 0.085;
    const lineColor = lerpPaletteColor(lineStart, lineEnd, t);

    stroke(lineColor[0], lineColor[1], lineColor[2], 165 - t * 105);
    strokeWeight(map(t, 0, 1, 4.4, 0.7));
    noFill();
    beginShape();
    for (let a = 0; a <= TWO_PI + 0.2; a += PI / 90) {
      const sculptRadius =
        radius +
        sin(a * (3 + phaseShift(t)) + spin) * wave +
        cos(a * 2.2 - spin * 0.6) * unit * 0.015;
      const x = cos(a + spin) * sculptRadius * (1 + t * 0.24);
      const y = sin(a + spin * 0.82) * sculptRadius * (0.32 + t * 0.34);
      curveVertex(x, y);
    }
    endShape();
  }
  pop();

  stroke(NIGHT_PALETTE.glow[0], NIGHT_PALETTE.glow[1], NIGHT_PALETTE.glow[2], 90);
  strokeWeight(max(unit * 0.005, 1.5));
  line(width * 0.12, height * 0.18, width * 0.88, height * 0.18);
  line(width * 0.16, height * 0.86, width * 0.84, height * 0.86);

  noStroke();
  fill(NIGHT_PALETTE.glow[0], NIGHT_PALETTE.glow[1], NIGHT_PALETTE.glow[2], 210);
  ellipse(width * 0.5, height * 0.54, unit * 0.04, unit * 0.04);

  noiseArvo += 0.002;
}

function drawNoiseEllipseScene() {
  const time = frameCount * 0.01;
  const unit = min(width, height);
  const seedCount = 520;
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const goldenAngle = 137.5;
  const phase = map(sin(time * 0.22), -1, 1, 0, 1);
  const shellTone = lerpPaletteColor(PASTEL_PALETTE.shell, PASTEL_PALETTE.sky, phase * 0.35);

  noStroke();
  fill(shellTone[0], shellTone[1], shellTone[2], 178);
  rect(width * 0.03, height * 0.05, width * 0.94, height * 0.9, 34);

  for (let i = 0; i < 8; i += 1) {
    const haloColor = [PASTEL_PALETTE.sky, PASTEL_PALETTE.lavender, PASTEL_PALETTE.mint, PASTEL_PALETTE.rose][i % 4];
    fill(haloColor[0], haloColor[1], haloColor[2], 18 + i * 2);
    ellipse(centerX, centerY, unit * (1.18 - i * 0.1), unit * (1.18 - i * 0.1));
  }

  for (let i = 0; i < seedCount; i += 1) {
    const angle = radians(i * goldenAngle + frameCount * 0.36);
    const radius = unit * map(sqrt(i), 0, sqrt(seedCount), 0.01, 0.6);
    const x = centerX + cos(angle) * radius;
    const y = centerY + sin(angle) * radius;
    const blossom = [
      PASTEL_PALETTE.peach,
      PASTEL_PALETTE.lavender,
      PASTEL_PALETTE.mint,
      PASTEL_PALETTE.sky,
      PASTEL_PALETTE.rose,
      PASTEL_PALETTE.gold,
    ][i % 6];
    const shimmer = sin(time * 1.8 + i * 0.07);
    const bloomSize = map(shimmer, -1, 1, unit * 0.008, unit * 0.04);
    const pulseColor = lerpPaletteColor(blossom, PASTEL_PALETTE.shell, map(shimmer, -1, 1, 0.05, 0.3));

    fill(pulseColor[0], pulseColor[1], pulseColor[2], 190);
    ellipse(x, y, bloomSize, bloomSize);
  }

  stroke(PASTEL_PALETTE.lavender[0], PASTEL_PALETTE.lavender[1], PASTEL_PALETTE.lavender[2], 95);
  strokeWeight(max(unit * 0.004, 1.2));
  noFill();
  for (let i = 0; i < 7; i += 1) {
    const ringSize = unit * (0.16 + i * 0.11 + sin(time * 0.5 + i) * 0.025);
    ellipse(centerX, centerY, ringSize, ringSize);
  }

  noStroke();
  fill(PASTEL_PALETTE.shell[0], PASTEL_PALETTE.shell[1], PASTEL_PALETTE.shell[2], 245);
  ellipse(centerX, centerY, unit * 0.18, unit * 0.18);
  fill(PASTEL_PALETTE.gold[0], PASTEL_PALETTE.gold[1], PASTEL_PALETTE.gold[2], 220);
  ellipse(centerX, centerY, unit * (0.05 + phase * 0.03), unit * (0.05 + phase * 0.03));

  noiseArvo += 0.0015;
}

function phaseShift(value) {
  return 1 + sin(frameCount * 0.01 + value * TWO_PI) * 0.8;
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
