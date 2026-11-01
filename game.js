const cells = [...document.querySelectorAll(".cell")];
const modeButtons = [...document.querySelectorAll(".mode-btn")];
const turnSymbol = document.getElementById("turn-symbol");
const turnName = document.getElementById("turn-name");
const turnHint = document.getElementById("turn-hint");
const resultText = document.getElementById("result-text");
const resultIcon = document.querySelector(".result-icon");
const statusPill = document.getElementById("status-pill");
const winLine = document.getElementById("win-line");

const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let board = Array(9).fill("");
let current = "X";
let mode = "friend";
let finished = false;
let history = [];
let round = 1;
let scores = {X:0,O:0,draw:0};
let cpuTimer = null;

function updateTurn() {
  turnSymbol.textContent = current;
  turnSymbol.className = "turn-symbol " + (current === "X" ? "x-color" : "o-color");
  const cpuTurn = mode === "computer" && current === "O";
  turnName.textContent = cpuTurn ? "CPU" : `PLAYER ${current}`;
  turnHint.textContent = cpuTurn ? "THINKING..." : "MAKE YOUR MOVE";
  document.getElementById("player-o-label").textContent = mode === "computer" ? "CPU" : "PLAYER O";
}
function updateScores() {
  document.getElementById("score-x").textContent = scores.X;
  document.getElementById("score-o").textContent = scores.O;
  document.getElementById("score-draw").textContent = scores.draw;
}
function updateRound() { document.getElementById("round-title").textContent = "ROUND " + String(round).padStart(2,"0"); }
function setMessage(message, icon="✦") { resultText.textContent = message; resultIcon.textContent = icon; }
function render() {
  cells.forEach((cell,i) => {
    cell.textContent = board[i];
    cell.className = "cell" + (board[i] ? " " + board[i].toLowerCase() : "");
    cell.disabled = finished || !!board[i] || (mode === "computer" && current === "O");
    cell.setAttribute("aria-label", `Cell ${i+1}: ${board[i] || "empty"}`);
  });
  document.getElementById("undo").disabled = history.length === 0 || finished;
  updateTurn();
}
function winnerOf(state) {
  for (const line of wins) if (state[line[0]] && state[line[0]] === state[line[1]] && state[line[1]] === state[line[2]]) return {player:state[line[0]],line};
  return null;
}
function drawWinLine(line) {
  const boardBox = document.getElementById("board").getBoundingClientRect();
  const first = cells[line[0]].getBoundingClientRect();
  const last = cells[line[2]].getBoundingClientRect();
  const x1 = first.left + first.width/2 - boardBox.left;
  const y1 = first.top + first.height/2 - boardBox.top;
  const x2 = last.left + last.width/2 - boardBox.left;
  const y2 = last.top + last.height/2 - boardBox.top;
  const dx=x2-x1,dy=y2-y1;
  winLine.style.display="block";
  winLine.style.left=x1+"px";winLine.style.top=y1+"px";
  winLine.style.width=Math.hypot(dx,dy)+"px";
  winLine.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
}
function finishGame() {
  const win = winnerOf(board);
  if (win) {
    finished = true; scores[win.player]++;
    win.line.forEach(i=>cells[i].classList.add("winner"));
    statusPill.textContent = "ROUND COMPLETE";statusPill.classList.add("finished");
    setMessage(mode==="computer" && win.player==="O" ? "CPU takes this round. Rematch?" : `${win.player==="X"?"Player X":mode==="computer"?"You":"Player O"} wins the round!`, "🏆");
    requestAnimationFrame(()=>drawWinLine(win.line));
    updateScores();render();return true;
  }
  if (board.every(Boolean)) {
    finished=true;scores.draw++;statusPill.textContent="DRAW GAME";statusPill.classList.add("finished");
    setMessage("A perfect tie. Nobody backs down!", "＝");updateScores();render();return true;
  }
  return false;
}
function play(index) {
  if (finished || board[index] || (mode==="computer" && current==="O")) return;
  history.push({board:[...board],current});
  board[index]=current;
  if (!finishGame()) {current=current==="X"?"O":"X";render();setMessage(mode==="computer"&&current==="O"?"CPU is thinking...":`Your move, Player ${current}`);if(mode==="computer"&&current==="O") cpuTimer=setTimeout(cpuMove,420);}
  else setMessage(resultText.textContent,resultIcon.textContent);
}
function minimax(state, player, depth=0) {
  const win=winnerOf(state);
  if(win) return win.player==="O" ? 10-depth : depth-10;
  if(state.every(Boolean)) return 0;
  const moves=[];
  for(let i=0;i<9;i++) if(!state[i]) {
    state[i]=player;
    const score=minimax(state,player==="O"?"X":"O",depth+1);
    state[i]="";moves.push({i,score});
  }
  if(player==="O") return Math.max(...moves.map(m=>m.score));
  return Math.min(...moves.map(m=>m.score));
}
function cpuMove() {
  if(finished||mode!=="computer"||current!=="O")return;
  let best=-Infinity,choices=[];
  for(let i=0;i<9;i++)if(!board[i]){
    board[i]="O";const score=minimax(board,"X");board[i]="";
    if(score>best){best=score;choices=[i]}else if(score===best)choices.push(i);
  }
  const choice=choices[Math.floor(Math.random()*choices.length)];
  if(choice!==undefined){history.push({board:[...board],current});board[choice]="O";if(!finishGame()){current="X";render();setMessage("Your turn. Find the winning line.");}}
}
function newRound() {
  clearTimeout(cpuTimer);board=Array(9).fill("");current="X";finished=false;history=[];round++;
  winLine.style.display="none";statusPill.textContent="IN PROGRESS";statusPill.classList.remove("finished");
  updateRound();setMessage("Your move, Player X");render();
}
function undoMove() {
  if(!history.length||finished)return;clearTimeout(cpuTimer);
  const previous=history.pop();board=previous.board;current=previous.current;
  if(mode==="computer"&&history.length){const prior=history.pop();board=prior.board;current=prior.current;}
  setMessage("Move undone. Your turn.");render();
}
modeButtons.forEach(btn=>btn.addEventListener("click",()=>{
  if(mode===btn.dataset.mode)return;mode=btn.dataset.mode;modeButtons.forEach(b=>b.classList.toggle("active",b===btn));
  scores={X:0,O:0,draw:0};updateScores();round=0;newRound();
  setMessage(mode==="computer"?"You are X. Beat the CPU!":"Player X goes first.");
}));
cells.forEach(cell=>cell.addEventListener("click",()=>play(Number(cell.dataset.index))));
document.getElementById("new-round").addEventListener("click",newRound);
document.getElementById("undo").addEventListener("click",undoMove);
document.getElementById("reset-score").addEventListener("click",()=>{scores={X:0,O:0,draw:0};updateScores();round=0;newRound();setMessage("Fresh start. Good luck!");});
window.addEventListener("resize",()=>{const win=winnerOf(board);if(finished&&win)drawWinLine(win.line);});
updateRound();render();