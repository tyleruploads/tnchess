const chessboardDiv = document.getElementById("chessboard");
const newGameButton = document.getElementById("newGameButton");
const turnIndicator = document.querySelector("#turn-indicator > span");

const whiteInfoBar = document.querySelector(".player-info.white-player");
const blackInfoBar = document.querySelector(".player-info.black-player");

const whiteNetMaterialEl = document.querySelector(
  ".player-info.white-player .net-material",
);
const blackNetMaterialEl = document.querySelector(
  ".player-info.black-player .net-material",
);

const whiteCapturedPiecesDiv = document.querySelector(
  ".player-info.white-player .info-pieces-container",
);
const blackCapturedPiecesDiv = document.querySelector(
  ".player-info.black-player .info-pieces-container",
);

let squares = null;
let selectedSquare = null;

let chessboardState = null;

let whiteCapturedPieces = [];
let blackCapturedPieces = [];

let currentTurn = "w";

document.addEventListener("DOMContentLoaded", startGame);

newGameButton.addEventListener("click", startGame);

const PIECE_SYMBOLS = {
  K: "\u265A\uFE0E",
  Q: "\u265B\uFE0E",
  R: "\u265C\uFE0E",
  B: "\u265D\uFE0E",
  N: "\u265E\uFE0E",
  P: "\u265F\uFE0E",
};

const PIECE_VALUES = {
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
};

function startGame() {
  chessboardState = [
    ["Rb", "Nb", "Bb", "Qb", "Kb", "Bb", "Nb", "Rb"],
    Array(8).fill("Pb"),
    ...Array.from({ length: 4 }, () => Array(8).fill("")),
    Array(8).fill("Pw"),
    ["Rw", "Nw", "Bw", "Qw", "Kw", "Bw", "Nw", "Rw"],
  ];
  currentTurn = "w";
  whiteCapturedPieces = [];
  blackCapturedPieces = [];

  drawBoard();
  drawPieces();
  drawMaterial();

  whiteInfoBar.classList.add("active");
  blackInfoBar.classList.remove("active");

  turnIndicator.textContent = "White to Move";

  squares = document.querySelectorAll(".square");
}

function getNotation(row, col) {
  const files = "abcdefgh";
  return `${files[col]}${8 - row}`;
}

function getPieceSymbol(pieceCode) {
  const pieceType = pieceCode.charAt(0);

  if (pieceType === "") {
    return "\u00A0";
  }

  return PIECE_SYMBOLS[pieceType];
}

function getPieceColorClass(pieceCode) {
  const pieceColor = pieceCode.charAt(1);

  if (pieceColor === "") {
    return "";
  }

  return pieceColor === "w" ? "light-piece" : "dark-piece";
}

function getMaterialValue(pieces) {
  return pieces.reduce((total, piece) => total + (PIECE_VALUES[piece] ?? 0), 0);
}

function drawBoard() {
  chessboardDiv.replaceChildren();
  for (let i = 0; i < 64; ++i) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const notation = getNotation(row, col);

    const color = (row + col) % 2 === 0 ? "light-square" : "dark-square";

    const square = document.createElement("div");

    square.classList.add("square", color);
    square.setAttribute("data-color", color);
    square.setAttribute("data-notation", notation);
    square.setAttribute("data-row", row);
    square.setAttribute("data-col", col);

    square.addEventListener("click", () => {
      const piece = square.querySelector(".piece");

      if (!selectedSquare && !piece) return;

      if (square === selectedSquare) {
        clearHighlights();
        selectedSquare = null;
        return;
      }

      if (selectedSquare) {
        const fromRow = selectedSquare.getAttribute("data-row");
        const fromCol = selectedSquare.getAttribute("data-col");
        const pieceCode = chessboardState[fromRow][fromCol];

        if (pieceCode.charAt(1) !== currentTurn) return;

        if (validateMove(selectedSquare, square)) {
          movePiece(selectedSquare, square);
          clearHighlights();
          selectedSquare = null;
          return;
        }

        if (piece) {
          const toRow = square.getAttribute("data-row");
          const toCol = square.getAttribute("data-col");
          const toPieceCode = chessboardState[toRow][toCol];

          if (toPieceCode.charAt(1) === currentTurn) {
            clearHighlights();
            selectedSquare = square;
            piece.classList.add("selected");
          }
        }
        return;
      }

      const row = square.getAttribute("data-row");
      const col = square.getAttribute("data-col");
      const pieceCode = chessboardState[row][col];

      if (pieceCode.charAt(1) !== currentTurn) return;

      clearHighlights();
      selectedSquare = square;
      piece.classList.add("selected");
    });

    chessboardDiv.appendChild(square);
  }
}

function drawPieces() {
  for (const square of chessboardDiv.children) {
    const row = square.getAttribute("data-row");
    const col = square.getAttribute("data-col");
    const pieceCode = chessboardState[row][col];
    const pieceSymbol = getPieceSymbol(pieceCode);
    const pieceColorClass = getPieceColorClass(pieceCode);

    if (pieceCode === "") {
      square.replaceChildren();
      continue;
    }

    const pieceElement = document.createElement("span");

    pieceElement.classList.add("piece", pieceColorClass);
    pieceElement.textContent = pieceSymbol;

    square.replaceChildren(pieceElement);
  }
}

function drawMaterial() {
  const groups = [
    {
      type: "dark-piece",
      pieces: whiteCapturedPieces,
      container: whiteCapturedPiecesDiv,
    },
    {
      type: "light-piece",
      pieces: blackCapturedPieces,
      container: blackCapturedPiecesDiv,
    },
  ];

  const points = {
    white: 0,
    black: 0,
  };

  for (const { type, pieces, container } of groups) {
    container.replaceChildren();
    if (pieces === null) continue;

    let pointsTarget = type === "dark-piece" ? "white" : "black";

    points[pointsTarget] = getMaterialValue(pieces);

    for (const pieceType of pieces) {
      const pieceEl = document.createElement("span");

      pieceEl.classList.add("captured-piece", type);
      pieceEl.textContent = PIECE_SYMBOLS[pieceType];

      container.appendChild(pieceEl);
    }
  }

  const formatter = new Intl.NumberFormat("en-US", {
    signDisplay: "exceptZero",
    useGrouping: false,
  });

  whiteNetMaterialEl.textContent = formatter.format(
    points["white"] - points["black"],
  );
  blackNetMaterialEl.textContent = formatter.format(
    points["black"] - points["white"],
  );
}

function clearHighlights() {
  squares.forEach((sq) => {
    const piece = sq.querySelector(".piece");
    if (piece) piece.classList.remove("selected");
  });
}

function findKing(color) {
  const kingCode = `K${color}`;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (chessboardState[r][c] === kingCode) {
        return { row: r, col: c };
      }
    }
  }
}

function isBlocked(fromRow, fromCol, toRow, toCol) {
  const rowStep = Math.sign(toRow - fromRow);
  const colStep = Math.sign(toCol - fromCol);
  const steps = Math.max(Math.abs(toRow - fromRow), Math.abs(toCol - fromCol));

  return Array.from(
    { length: steps - 1 },
    (_, i) =>
      chessboardState[fromRow + (i + 1) * rowStep][fromCol + (i + 1) * colStep],
  ).some(Boolean);
}

function isSquareAttacked(row, col, enemyColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const pieceCode = chessboardState[r][c];
      if (pieceCode !== "" && pieceCode.endsWith(enemyColor)) {
        if (canPieceAttack(r, c, row, col)) {
          return true;
        }
      }
    }
  }

  return false;
}

function isCheck(defenderColor) {
  const kingPos = findKing(defenderColor);

  if (!kingPos) return false;

  const enemyColor = defenderColor === "w" ? "b" : "w";
  return isSquareAttacked(kingPos.row, kingPos.col, enemyColor);
}

function isCheckmate(defenderColor) {
  const kingPos = findKing(defenderColor);
  const enemyColor = defenderColor === "w" ? "b" : "w";

  if (!kingPos) return false;

  if (!isSquareAttacked(kingPos.row, kingPos.col, enemyColor)) return false;

  for (let pieceR = 0; pieceR < 8; pieceR++) {
    for (let pieceC = 0; pieceC < 8; pieceC++) {
      const piece = chessboardState[pieceR][pieceC];
      if (!piece || piece[1] !== defenderColor) continue;
      const fromSquare = document.querySelector(
        `[data-row="${pieceR}"][data-col="${pieceC}"]`,
      );

      for (let targetR = 0; targetR < 8; targetR++) {
        for (let targetC = 0; targetC < 8; targetC++) {
          const toSquare = document.querySelector(
            `[data-row="${targetR}"][data-col="${targetC}"]`,
          );
          if (validateMove(fromSquare, toSquare)) return false;
        }
      }
    }
  }

  return true;
}

function canPieceAttack(fromRow, fromCol, toRow, toCol) {
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  if (rowDiff === 0 && colDiff === 0) return false;

  const fromPiece = chessboardState[fromRow][fromCol];
  const toPiece = chessboardState[toRow][toCol];

  const pieceType = fromPiece.charAt(0);

  switch (pieceType) {
    case "R":
      return (
        (rowDiff === 0 || colDiff === 0) &&
        !isBlocked(fromRow, fromCol, toRow, toCol)
      );
    case "B":
      return (
        Math.abs(rowDiff) === Math.abs(colDiff) &&
        !isBlocked(fromRow, fromCol, toRow, toCol)
      );
    case "N":
      return (
        (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
        (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
      );
    case "Q":
      return (
        (rowDiff === 0 ||
          colDiff === 0 ||
          Math.abs(rowDiff) === Math.abs(colDiff)) &&
        !isBlocked(fromRow, fromCol, toRow, toCol)
      );
    case "K":
      return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
    case "P":
      const dir = fromPiece.endsWith("w") ? -1 : 1;
      return Math.abs(colDiff) === 1 && rowDiff === dir;
    default:
      return false;
  }
}

function validateMove(fromSquare, toSquare) {
  const fromRow = parseInt(fromSquare.getAttribute("data-row"), 10);
  const fromCol = parseInt(fromSquare.getAttribute("data-col"), 10);
  const toRow = parseInt(toSquare.getAttribute("data-row"), 10);
  const toCol = parseInt(toSquare.getAttribute("data-col"), 10);

  if (fromRow === toRow && fromCol === toCol) return false;

  const fromPiece = chessboardState[fromRow][fromCol];
  const toPiece = chessboardState[toRow][toCol];

  const pieceType = fromPiece.charAt(0);
  const fromColor = fromPiece.charAt(1);

  if (fromColor !== currentTurn) return false;

  if (toPiece !== "") {
    const toColor = toPiece.charAt(1);

    if (fromColor === toColor) {
      return false;
    }

    if (toPiece.charAt(0) === "K") {
      return false;
    }
  }

  let moveLooksValid = false;

  if (pieceType === "P") {
    const dir = fromPiece.endsWith("w") ? -1 : 1;
    const rDiff = toRow - fromRow;
    const cDiff = Math.abs(toCol - fromCol);
    const isForward =
      cDiff === 0 &&
      (rDiff === dir ||
        (rDiff === dir * 2 &&
          fromRow === (dir === -1 ? 6 : 1) &&
          !isBlocked(fromRow, fromCol, toRow, toCol)));
    const isDiagonal = cDiff === 1 && rDiff === dir && toPiece !== "";

    moveLooksValid = (isForward && toPiece === "") || isDiagonal;
  } else {
    moveLooksValid = canPieceAttack(fromRow, fromCol, toRow, toCol);
  }

  if (!moveLooksValid) return false;

  const originalFromPiece = chessboardState[fromRow][fromCol];
  const originalToPiece = chessboardState[toRow][toCol];

  chessboardState[toRow][toCol] = originalFromPiece;
  chessboardState[fromRow][fromCol] = "";

  let isInCheck;

  try {
    isInCheck = isCheck(fromColor);
  } finally {
    chessboardState[fromRow][fromCol] = originalFromPiece;
    chessboardState[toRow][toCol] = originalToPiece;
  }

  return !isInCheck;
}

function movePiece(fromSquare, toSquare) {
  const fromRow = parseInt(fromSquare.getAttribute("data-row"), 10);
  const fromCol = parseInt(fromSquare.getAttribute("data-col"), 10);
  const toRow = parseInt(toSquare.getAttribute("data-row"), 10);
  const toCol = parseInt(toSquare.getAttribute("data-col"), 10);

  const toPieceCode = chessboardState[toRow][toCol];

  if (toPieceCode) {
    const toPieceType = toPieceCode.charAt(0);
    const toPieceColor = toPieceCode.charAt(1);

    const capturedPieces =
      toPieceColor === "w" ? blackCapturedPieces : whiteCapturedPieces;

    capturedPieces.push(toPieceType);
  }

  chessboardState[toRow][toCol] = chessboardState[fromRow][fromCol];
  chessboardState[fromRow][fromCol] = "";

  drawPieces();
  drawMaterial();

  currentTurn = currentTurn === "w" ? "b" : "w";

  document.querySelectorAll(".square.in-check").forEach((sq) => {
    sq.classList.remove("in-check");
  });

  const kingPos = findKing(currentTurn);
  const attackerColor = currentTurn === "w" ? "b" : "w";

  if (kingPos && isSquareAttacked(kingPos.row, kingPos.col, attackerColor)) {
    const kingSquare = document.querySelector(
      `[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`,
    );
    if (kingSquare) {
      kingSquare.classList.add("in-check");
    }
  }

  if (isCheckmate(currentTurn)) {
    showEndDialog(
      "Checkmate!",
      `${attackerColor == "w" ? "White" : "Black"} wins!`,
    );

    whiteInfoBar.classList.remove("active");
    blackInfoBar.classList.remove("active");

    turnIndicator.textContent = "Checkmate!";

    return;
  }

  const indicatorText = currentTurn === "w" ? "White to Move" : "Black to Move";

  whiteInfoBar.classList.toggle("active", currentTurn === "w");
  blackInfoBar.classList.toggle("active", currentTurn === "b");

  turnIndicator.textContent = indicatorText;
}

function showEndDialog(title, reason) {
  document.getElementById("game-over-title").textContent = title;
  document.getElementById("game-over-reason").textContent = reason;
  document.getElementById("game-over-dialog").showModal();
}
