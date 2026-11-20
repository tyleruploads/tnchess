const chessboardDiv = document.getElementById("chessboard");

const PIECE_SYMBOLS = {
  K: "\u265A\uFE0E",
  Q: "\u265B\uFE0E",
  R: "\u265C\uFE0E",
  B: "\u265D\uFE0E",
  N: "\u265E\uFE0E",
  P: "\u265F\uFE0E",
};

let chessboardState = [
  ["Rb", "Nb", "Bb", "Qb", "Kb", "Bb", "Nb", "Rb"],
  Array(8).fill("Pb"),
  ...Array.from({ length: 4 }, () => Array(8).fill("")),
  Array(8).fill("Pw"),
  ["Rw", "Nw", "Bw", "Qw", "Kw", "Nw", "Bw", "Rw"],
];

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

function drawBoard() {
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

document.addEventListener("DOMContentLoaded", () => {
  drawBoard();
  drawPieces();
});
