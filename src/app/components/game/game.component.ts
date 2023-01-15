import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, isObservable, Subscription } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';
import { PlayerService } from 'src/app/services/player.service';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [SocketioService]
})
export class GameComponent implements OnInit, OnDestroy {
  playerName: string;
  opponentName: string;
  players: Object = {};
  nameForm: FormGroup;
  gameCode: number;
  gameCodeSubscriber: Subscription;
  gameDetails: Object;
  board = [[], [], []];
  gameOver: boolean = false;
  doneLoading: boolean = false;
  opponentFound: boolean = false;
  winner: string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private http: HttpService,
              private player: PlayerService,
              private socket: SocketioService) {

    this.gameCodeSubscriber = this.route.params.subscribe((params) => {
      this.gameCode = params['id'];
    });
  }

  ngOnInit(){
    if (this.player.playerName !== undefined){
      this.playerName = this.player.playerName;
    } else {
      this.nameForm = new FormGroup({
        name: new FormControl(null, Validators.required)
      });
    }
    if (this.player.playerNumber === undefined
      && localStorage.getItem("rejoinCode") === undefined){ // Join from link with rejoin code
      this.player.playerNumber = 2;

    } else if (this.player.playerNumber !== undefined 
      && localStorage.getItem("rejoinCode") !== undefined){ // Join from game creation
      this.player.playerNumber = 1;

    } else if (this.player.playerNumber == undefined 
      && localStorage.getItem("rejoinCode") !== undefined){ // Join from link
      this.player.playerNumber = 2;
      
    } 

    this.http.getRoomDetails(this.gameCode).subscribe(
    (res) => {
      if (res.status === 200){
        this.gameDetails = JSON.parse(res.body);

          if (this.gameDetails['turn'] === 1 && this.player.playerNumber === 1){
            this.player.thisPlayersTurn = true;
          } else if (this.gameDetails['turn'] === 2 && this.player.playerNumber === 2){
            this.player.thisPlayersTurn = true;
          } else {
            this.player.thisPlayersTurn = false;
          }
          this.loadBoard();
        
      }
    },
    (error) => {
      console.log(error);
      this.router.navigate(['/']);
    })
    
    if (this.gameCode !== undefined){
      this.gameCodeSubscriber.unsubscribe();
    }

    // Websocketing
    this.socket.connectToSocket();
    if (this.player.playerNumber === 1){
      this.socket.joinRoom(this.gameCode, this.player.playerNumber, this.playerName);
    }
    this.socket.activateListeners();

    this.socket.dataEmitter.subscribe((val) => {
      this.gameDetails = val;
      this.players = JSON.parse(this.gameDetails['players']);
      this.loadBoard();
      if (this.gameDetails['game_over'] === false){
        this.swapTurns();
      } else {
        this.player.thisPlayersTurn = false; this.gameOver = true; this.opponentFound = false; // Make sure no more moves can happen
        localStorage.removeItem("rejoinCode");
      }
    })
    this.socket.unlockGameEmitter.subscribe((val) => {
      if (val['unlock'] === true){
        const players = JSON.parse(val['players'])
        this.player.opponentName = this.player.playerNumber === 1 ? players['p2'] : players['p1'];
        this.opponentName = this.player.opponentName;
        this.opponentFound = true;
      }
    })
  }

  ngOnDestroy() {
    this.socket.dataEmitter.unsubscribe();
  }

  onJoinGame(){
    this.http.JoinGame(this.gameCode, this.playerName).subscribe((res) =>{
      if (res.status === 200){
        localStorage.setItem("rejoinCode", res.body);
        this.doneLoading = true;
        if (this.player.playerNumber === 2){
          this.socket.joinRoom(this.gameCode, this.player.playerNumber, this.playerName);
        }
      }
    });
    
  }

  swapTurns(){
    if (this.gameDetails['turn'] === 1 && this.player.playerNumber === 1){
      this.player.thisPlayersTurn = true;
    } else if (this.gameDetails['turn'] === 2 && this.player.playerNumber === 2){
      this.player.thisPlayersTurn = true;
    } else {
      this.player.thisPlayersTurn = false;
    }
  }

  loadBoard(){
    const board = JSON.parse(this.gameDetails['board']);
    let row = 0;
    this.board = [[], [], []];
    board.forEach((element: number, index: number) => {
      this.board[row].push(element);
      if ((index+1) % 3 === 0){
        row++;
      }
    });
    this.doneLoading = true;
  }

  placePiece(event, x, y){
    if (event.srcElement.innerHTML.trim() === "" && this.player.thisPlayersTurn === true && this.opponentFound == true){
      this.player.playerNumber === 1 ? event.srcElement.innerHTML = "X" : event.srcElement.innerHTML = "O";
      this.player.thisPlayersTurn = false;
      const serverData = JSON.stringify({game: this.gameCode, turn: this.player.playerNumber, position: [x, y]});
      this.socket.submitData(this.gameCode, serverData);
    }
    
  }

  onSubmitName(){
    this.playerName = this.player.firstLetterToUpper(this.nameForm.value.name);
    this.onJoinGame();
  }

}
