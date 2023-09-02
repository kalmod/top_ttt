// Main script
//
//
// I want to create a 2 d arry.
// Do I want to disable the event listener? Or is what I have fine?
// Now that it's disable, have a button to wipe and recreate the board
//
// Let's develop a game state. Restart is disabled while array is empty.
// Start is only available when array is empty.
// I think i have to contain all of this in a loop.
// 
const moves = {7:[0,0],8:[0,1],9:[0,2],4:[1,0],5:[1,1],6:[1,2],1:[2,0],2:[2,1],3:[2,2]}
const playerSymbol = {'X':1,'O':2};

const theGameBoard = (() =>{
  let totalMoves = 0;
  let playerTurn = true;
  let board = new Array(3).fill(0).map(()=> new Array(3).fill(0));
  let validMoves = new Set();
  function checkWinner(){
    // checks if player 1 or 2 won.
    for (let i = 0; i < 3; i++){
      if (this.board[i][0] == this.board[i][1] && this.board[i][0] == this.board[i][2] && this.board[i][0] != 0){
        return this.board[i][0];
      }
      if (this.board[0][i] == this.board[1][i] && this.board[0][i] == this.board[2][i] && this.board[0][i] != 0){
        return this.board[0][i];
      } 
      if (((this.board[1][1] == this.board[0][0] && this.board[1][1] == this.board[2][2])
        || (this.board[1][1] == this.board[0][2] && this.board[1][1] == this.board[2][0])) && this.board[1][1] != 0){
        return this.board[1][1];
      }
    }
    let isTie = this.board.every((row)=> (row.every((cell)=> isNaN(cell))));
    return isTie ? 'TIE' : 'PROG';
  }
  function updateTotalMoves(){
    totalMoves++;
  }
  function boardWipe(){
    this.board = new Array(3).fill(0).map(()=>new Array(3).fill(0));
    this.validMoves = new Set();
  }
  return {updateTotalMoves,playerTurn,validMoves, board, checkWinner,boardWipe};
})();

function createPlayer(playerType){
  const isAi = (b) => { return playerType ? 'ai' : 'human'}
  return {
    playerType: isAi(playerType),
  }
}

const gameboardEle = document.querySelector('.gameboard');
const theResetButton = document.querySelector('.restart');
const startGameButton = document.querySelector('.startGame');
const currentPlayerSpan = document.querySelector('.currentPlayer span')
const aiSwitch = document.querySelector('#ai');

// Modal
const gameOverDialog = document.querySelector('.gameOver');
const gameOverDialogButton = document.querySelector('.gameOver > button');
const gameOverDialogMessage = document.querySelector('.gameOver > div');

theResetButton.addEventListener('click',resetBoard);
startGameButton.addEventListener('click',main);
gameOverDialogButton.addEventListener('click',()=>{gameOverDialog.close(); resetBoard();});

function createGameboard(gameboard){
  for(let row = 0; row < theGameBoard.board.length; row++){
    for(let col = 0; col < theGameBoard.board[0].length; col++){
      const newDiv = document.createElement('div');
      newDiv.className = 'cell';
      newDiv.setAttribute('data-row',`${row}`);
      newDiv.setAttribute('data-col',`${col}`);
      newDiv.addEventListener('click',function(){
        playerMove(newDiv);
        ;}, {once: true}
      );
      gameboard.appendChild(newDiv);
    }
  }
}

function playerMove(gameboardCell){
  // console.log(gameboardCell);
  if (gameboardCell.querySelector('.playerMark')){
    return
  }
  const newMark = document.createElement('p');
  newMark.className = 'playerMark'
  const [row,col] = [gameboardCell.dataset.row, gameboardCell.dataset.col]
  theGameBoard.board[row][col] = getPlayerMark(theGameBoard.playerTurn); 
  newMark.innerText = getPlayerMark(theGameBoard.playerTurn);
  gameboardCell.appendChild(newMark);
  endPlayerTurn(row,col);
  return;
}

function endPlayerTurn(row, col){

  theGameBoard.validMoves.add(`${row}_${col}`);
  theGameBoard.playerTurn = !theGameBoard.playerTurn;
  currentPlayerSpan.innerText = getPlayerMark(theGameBoard.playerTurn);
  theGameBoard.updateTotalMoves();
}

aiSwitch.addEventListener('change', function(){
  resetBoard();
})

function resetBoard(){
  console.log("RESETTING BOARD");
  theGameBoard.playerTurn = true;
  while (gameboardEle.firstChild){
    gameboardEle.removeChild(gameboardEle.firstChild);
  }
  currentPlayerSpan.innerText = getPlayerMark(theGameBoard.playerTurn);
  currentPlayerSpan.innerText = '';
  theGameBoard.boardWipe();
}

function getPlayerMark(currentTurn){
  return (currentTurn) ? 'X' : 'O';
}

let playerOne = createPlayer(false);
let playerTwo = createPlayer(aiSwitch.checked);

function main(){
  resetBoard();
  currentPlayerSpan.innerText = getPlayerMark(theGameBoard.playerTurn);
  createGameboard(gameboardEle);

  playerOne = createPlayer(false);
  playerTwo = createPlayer(aiSwitch.checked);

  gameLoop(playerOne,playerTwo);
}

function gameLoop(){
  let winner = theGameBoard.checkWinner();
  // console.log(theGameBoard.playerTurn);
  if( winner != 'PROG' ){
    let winMessage = (winner == 'TIE') ? 'Its a Tie!' : `Player ${playerSymbol[winner]} wins!`;
    gameOverDialogMessage.innerText=winMessage; 
    gameOverDialog.showModal();
    return;
  }
  if (playerTwo.playerType == 'ai' && !theGameBoard.playerTurn){
    // console.log('AI MOVES', !theGameBoard.playerTurn);
    aiMove();
  }
  window.requestAnimationFrame(gameLoop);
}

function aiMove(){
  let bestMove = [-1,-1]
  let moveValue = Number.NEGATIVE_INFINITY;
  for (const move in moves){
    if (!theGameBoard.validMoves.has(moves[move].join("_"))){
      let [r, c] = moves[move];
      theGameBoard.validMoves.add(moves[move].join("_"));
      theGameBoard.board[r][c] = getPlayerMark(theGameBoard.playerTurn);

      const newValue = minimax(theGameBoard.validMoves,false);
      if (newValue > moveValue){
        moveValue = newValue;
        bestMove = [r,c];
      }
      theGameBoard.validMoves.delete(moves[move].join("_"));
      theGameBoard.board[r][c] = 0;
    }
  }
  theGameBoard.validMoves.add(bestMove.join("_"));
  const aiCell = document.querySelector(`[data-row="${bestMove[0]}"][data-col="${bestMove[1]}"]`);
  playerMove(aiCell);
}

function minimax(currentMoves,maximizingPlayer,depth=0){
  const w = theGameBoard.checkWinner();
  if (w in playerSymbol){

    return maximizingPlayer ?  -10+depth:10-depth;
  } 
  else if (w == 'TIE'){
    return 0;
  }
  if (maximizingPlayer){
    let value = Number.NEGATIVE_INFINITY;
    depth+=1;

    for (const move in moves){
      if (!currentMoves.has(moves[move].join("_"))){
        currentMoves.add(moves[move].join("_"));
        theGameBoard.board[moves[move][0]][moves[move][1]]=getPlayerMark(!maximizingPlayer);

        value = Math.max(value,minimax(currentMoves,false,depth));

        theGameBoard.board[moves[move][0]][moves[move][1]]=0;
        currentMoves.delete(moves[move].join("_"));
      }
    }
    depth-=1;
    return value;
  }
  else{
    let value = Number.POSITIVE_INFINITY;
    depth+=1;
    for (const move in moves){
      if (!currentMoves.has(moves[move].join("_"))){
        currentMoves.add(moves[move].join("_"));
        theGameBoard.board[moves[move][0]][moves[move][1]]=getPlayerMark(!maximizingPlayer);

        value = Math.min(value,minimax(currentMoves,true,depth));

        theGameBoard.board[moves[move][0]][moves[move][1]]=0;
        currentMoves.delete(moves[move].join("_"));
      }
    }
    depth-=1;
    return value;
  }
}
