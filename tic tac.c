#include <stdio.h>

char board[3][3];
char currentPlayer = 'X';

// Function to initialize the board
void initializeBoard() {
    for(int i=0;i<3;i++)
        for(int j=0;j<3;j++)
            board[i][j] = ' ';
}

// Function to display the board
void displayBoard() {
    printf("\n");
    for(int i=0;i<3;i++){
        printf(" %c | %c | %c \n", board[i][0], board[i][1], board[i][2]);
        if(i<2) printf("---|---|---\n");
    }
    printf("\n");
}

// Function to check for a winner
char checkWinner() {
    // Check rows & columns
    for(int i=0;i<3;i++){
        if(board[i][0]==board[i][1] && board[i][1]==board[i][2] && board[i][0]!=' ')
            return board[i][0];
        if(board[0][i]==board[1][i] && board[1][i]==board[2][i] && board[0][i]!=' ')
            return board[0][i];
    }
    // Check diagonals
    if(board[0][0]==board[1][1] && board[1][1]==board[2][2] && board[0][0]!=' ')
        return board[0][0];
    if(board[0][2]==board[1][1] && board[1][1]==board[2][0] && board[0][2]!=' ')
        return board[0][2];
    
    return ' '; // No winner yet
}

// Function to check if board is full
int isBoardFull() {
    for(int i=0;i<3;i++)
        for(int j=0;j<3;j++)
            if(board[i][j]==' ')
                return 0;
    return 1;
}

int main() {
    int row, col;
    char winner = ' ';
    
    initializeBoard();
    
    while(1){
        displayBoard();
        printf("Player %c, enter row and column (0-2): ", currentPlayer);
        scanf("%d %d", &row, &col);
        
        if(row<0 || row>2 || col<0 || col>2 || board[row][col]!=' '){
            printf("Invalid move! Try again.\n");
            continue;
        }
        
        board[row][col] = currentPlayer;
        winner = checkWinner();
        
        if(winner != ' '){
            displayBoard();
            printf("Player %c wins!\n", winner);
            break;
        } else if(isBoardFull()){
            displayBoard();
            printf("It's a draw!\n");
            break;
        }
        
        // Switch player
        currentPlayer = (currentPlayer=='X') ? 'O' : 'X';
    }
    
    return 0;
}
