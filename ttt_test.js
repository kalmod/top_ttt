//https://sebhastian.com/javascript-console-input/
//https://www.npmjs.com/package/readline-sync
//https://dmitripavlutin.com/check-if-object-has-property-javascript/
//https://alialaa.com/blog/tic-tac-toe-js-minimax
// const readline = require("readline");

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// async function f(){
//     rl.question('Enter thing:',function(answer){
//         rl.close();
//         return answer;
//     });
// }


// rl.setPrompt('Pop Platter Poo: ');
// rl.prompt();
// let b='';
// rl.on('line',(ans)=>{
//     b = ans;
//     rl.close();
// });


let readlineSync = require('readline-sync');
// let userName = readlineSync.question('Name please: ');
// console.log(`Hello ${userName}`);

const moves = {7:[0,0],8:[0,1],9:[0,2],4:[1,0],5:[1,1],6:[1,2],1:[2,0],2:[2,1],3:[2,2]}
const playerSymbol = {'A':1,'B':2};
let board = new Array(3).fill(0).map(()=> new Array(3).fill(0));
// let board = [[0,1,0],[0,1,0],[1,2,2]]
// playGame();
playGame2();

function outputBoard(){
    for(let r of board){
        process.stdout.write(r.join(' | '));
        console.log('');
    }
}

function checkWinner(){
    let winner = false;

    for (let r = 0; r < board.length; r++){
        if (board[0][r] == board[1][r] && board[1][r] == board[2][r] && board[0][r] != 0) winner = true;
        if (board[r][0] == board[r][1] && board[r][1] == board[r][2] && board[r][0] != 0) winner = true;        

    }
    if (board[0][0] == board[1][1] && board[1][1] == board[2][2] && board[1][1] != 0) winner = true;
    if (board[2][0] == board[1][1] && board[1][1] == board[0][2] && board[1][1] != 0) winner = true;
    return winner;
}

function playGame(){
    let turn = 0;
    let winner = false;
    let player = ''
    let validMoves = new Set();
    while (!winner){
        player = (turn%2 == 0) ? 'A':'B'
        let move = parseInt(readlineSync.question(`Player ${player} - Enter position to play:`));
        while (isNaN(move) || !moves.hasOwnProperty(move) || validMoves.has(moves[move].join("|"))){
            move = parseInt(readlineSync.question('Enter a valid number: '));
        }
        let [r, c] = moves[move];
        validMoves.add(moves[move].join("|"));
        console.log({r,c});
        board[r][c] = playerSymbol[player];
        outputBoard();
        winner = checkWinner();
        turn++;
    }
    console.log(`WINNER! Player-${player}`)
}

function playGame2(){
    let turn = 0;
    let winner = false;
    let player = ''
    let validMoves = new Set();
    // let validMoves = new Set([moves[1].join("|"),moves[2].join("|"),moves[3].join("|"),moves[5].join("|"),moves[8].join("|")]);
    // const moves = {7:[0,0],8:[0,1],9:[0,2],4:[1,0],5:[1,1],6:[1,2],1:[2,0],2:[2,1],3:[2,2]}
    while (!winner){
        player = (turn%2 == 0) ? 'A':'B'
        let move = 1000;
        if (player == 'A' && validMoves.size < 9){
             move = parseInt(readlineSync.question(`Player ${player} - Enter position to play:`));
            while (isNaN(move) || !moves.hasOwnProperty(move) || validMoves.has(moves[move].join("|"))){
                move = parseInt(readlineSync.question('Enter a valid number: '));
            }
            let [r, c] = moves[move];
            console.log({r,c});
            validMoves.add(moves[move].join("|"));
            board[r][c] = playerSymbol[player];
        } else if (validMoves.size < 9) {
            
            let bestMove = [-1,-1]
            let moveValue = Number.NEGATIVE_INFINITY;
            for (const move in moves){
                if (!validMoves.has(moves[move].join("|"))){
                    let [r, c] = moves[move];
                    validMoves.add(moves[move].join("|"));
                    board[r][c] = playerSymbol[player];
                    const newValue = minimax(validMoves,false);
                    console.log(r,c, '=', newValue);
                    if (newValue > moveValue){
                        moveValue = newValue;
                        bestMove = [r,c];
                    }
                    validMoves.delete(moves[move].join("|"));
                    board[r][c] = 0;
                }
            }
            // console.log(bestMove[0],bestMove[1], '=', moveValue);
            validMoves.add(bestMove.join("|"));
            board[bestMove[0]][bestMove[1]] = playerSymbol[player];
            
        }

       
        
        outputBoard();
        winner = checkWinner();
        if (validMoves.size == 9) break;
        turn++;
    }
    if (winner){
        console.log(`WINNER! Player-${player}`)
    } else {
        console.log('DRAW');
    }
}

function minimax(currentMoves,maximizingPlayer,depth=0){
    const w = checkWinner();
    // if (currentMoves.size>=5) {
    //     outputBoard();
    //     console.log(maximizingPlayer, maximizingPlayer ?  -10+depth:10-depth);
    // }

    if (w){
        // console.log({maximizingPlayer, depth}, maximizingPlayer ?  -10+depth:10-depth);
        // console.log(currentMoves);
        // outputBoard();
        return maximizingPlayer ?  -10+depth:10-depth;
    } 
    else if (currentMoves.size == 9 && !w){
        return 0;
    }
    if (maximizingPlayer){
        let value = Number.NEGATIVE_INFINITY;
        depth+=1;
        for (const move in moves){
            if (!currentMoves.has(moves[move].join("|"))){
                currentMoves.add(moves[move].join("|"));
                board[moves[move][0]][moves[move][1]]=2;
                
                value = Math.max(value,minimax(currentMoves,false,depth));
                
                board[moves[move][0]][moves[move][1]]=0;
                currentMoves.delete(moves[move].join("|"));
            }
        }
        depth-=1;
        return value;
    }
    else{
        let value = Number.POSITIVE_INFINITY;
        depth+=1;
        for (const move in moves){
            if (!currentMoves.has(moves[move].join("|"))){
                currentMoves.add(moves[move].join("|"));
                board[moves[move][0]][moves[move][1]]=1;
                
                value = Math.min(value,minimax(currentMoves,true,depth));
                
                board[moves[move][0]][moves[move][1]]=0;
                currentMoves.delete(moves[move].join("|"));
            }
        }
        depth-=1;
        return value;
    }
}