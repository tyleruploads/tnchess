const chessboardDiv = document.getElementById("chessboard");

let squares = null;
let selectedSquare = null;

document.addEventListener("DOMContentLoaded", () => {
  drawBoard();
  drawPieces();

  squares = document.querySelectorAll(".square");
});

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

    square.addEventListener("click", () => {
      const piece = square.querySelector(".piece");

      if (!selectedSquare && !piece) return;

      if (square === selectedSquare) {
        clearHighlights();
        selectedSquare = null;
        return;
      }

      if (selectedSquare) {
        if (!validateMove(selectedSquare, square)) {
          if (piece) {
            clearHighlights();
            selectedSquare = square;
            piece.classList.add("selected");
          }
          return;
        }

        movePiece(selectedSquare, square);
        clearHighlights();
        selectedSquare = null;
        return;
      }

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

function clearHighlights() {
  squares.forEach((sq) => {
    const piece = sq.querySelector(".piece");
    if (piece) piece.classList.remove("selected");
  });
}

function validateMove(fromSquare, toSquare) {
  const fromRow = parseInt(fromSquare.getAttribute("data-row"), 10);
  const fromCol = parseInt(fromSquare.getAttribute("data-col"), 10);
  const toRow = parseInt(toSquare.getAttribute("data-row"), 10);
  const toCol = parseInt(toSquare.getAttribute("data-col"), 10);

  const pieceCode = chessboardState[fromRow][fromCol];
  const pieceType = pieceCode.charAt(0);

  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;

  if (rowDiff === 0 && colDiff === 0) return false;

  const fromPiece = chessboardState[fromRow][fromCol];
  const toPiece = chessboardState[toRow][toCol];

  if (toPiece !== "") {
    const fromColor = fromPiece.charAt(1);
    const toColor = toPiece.charAt(1);
    if (fromColor === toColor) {
      return false;
    }

    if (toPiece.charAt(0) === "K") {
      return false;
    }
  }

  switch (pieceType) {
    case "R":
      return (rowDiff === 0 || colDiff === 0);
    case "B":
      return Math.abs(rowDiff) === Math.abs(colDiff);
    case "N":
      return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
             (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
    case "Q":
      return (rowDiff === 0 || colDiff === 0) || (Math.abs(rowDiff) === Math.abs(colDiff));
    case "K":
      return (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1);
    case "P":
      const dir = pieceCode.endsWith("w") ? -1 : 1;
      const rDiff = toRow - fromRow
      const cDiff = Math.abs(toCol - fromCol);
      const isForward = cDiff === 0 && (rDiff === dir || (rDiff === dir * 2 && fromRow === (dir === -1 ? 6 : 1)));
      const isDiagonal = cDiff === 1 && rDiff === dir && toPiece !== "";
      return isForward || isDiagonal;
    default:
      return false;
  }
}

function movePiece(fromSquare, toSquare) {
  const fromRow = parseInt(fromSquare.getAttribute("data-row"), 10);
  const fromCol = parseInt(fromSquare.getAttribute("data-col"), 10);
  const toRow = parseInt(toSquare.getAttribute("data-row"), 10);
  const toCol = parseInt(toSquare.getAttribute("data-col"), 10);

  chessboardState[toRow][toCol] = chessboardState[fromRow][fromCol];
  chessboardState[fromRow][fromCol] = "";

  drawPieces();
}
