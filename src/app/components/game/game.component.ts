import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';
import { PlayerService } from 'src/app/services/player.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { ToastrService } from 'ngx-toastr';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [SocketioService],
})
export class GameComponent implements OnInit, OnDestroy {
  playerName: string;
  opponentName: string;
  playerNumber: number;
  playerPiece: string;
  opponentPiece: string;
  gameCreator: boolean;
  players: Object = {};
  chat: string[] = [];
  nameForm: FormGroup;
  chatForm: FormGroup;
  gameCode: string;
  gameCodeSubscriber: Subscription;
  gameDetails: Object;
  board = [[], [], []];
  gameOver: boolean = false;
  doneLoading: boolean = false;
  opponentFound: boolean = false;
  resigned: boolean = false;
  pressedResign: boolean = false;
  draw: boolean = false;
  winner: string;
  rematchSubscription: Subscription;
  rematchRequested: boolean = false;
  listeningForRematch: boolean = false;
  opponentWantsRematch: boolean = false;
  disableChat: boolean = false;
  moveCounter: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private player: PlayerService,
    private socket: SocketioService,
    private toastr: ToastrService,
    private clipboard: Clipboard
  ) {
    this.gameCodeSubscriber = this.route.params.subscribe((params) => {
      this.gameCode = params['id'];
    });
  }

  ngOnInit() {
    if (this.player.playerName !== undefined) {
      this.playerName = this.player.playerName;
      this.gameCreator = true;
      this.onJoinGame();
    } else {
      this.nameForm = new FormGroup({
        name: new FormControl(null, [
          Validators.required,
          Validators.maxLength(10),
        ]),
      });
    }

    this.chatForm = new FormGroup({
      message: new FormControl(null, Validators.required),
    });

    if (this.gameCode !== undefined) {
      this.gameCodeSubscriber.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.socket.dataEmitter.unsubscribe();
    this.socket.unlockGameEmitter.unsubscribe();
    this.socket.listenForRematchEmitter.unsubscribe();
    this.socket.listenForMessages.unsubscribe();
    this.socket.listenForResignation.unsubscribe();
  }

  connectToSocket() {
    this.socket.connectToSocket();
    this.socket.activateListeners();
    this.socket.joinRoom(
      this.gameCode,
      this.player.playerNumber,
      this.playerName
    );

    this.socket.dataEmitter.subscribe((val) => {
      this.moveCounter++;
      this.gameDetails = val;
      this.loadBoard();
      this.players = JSON.parse(this.gameDetails['players']);
      this.player.opponentName =
        this.player.playerNumber === 1
          ? this.players['p2']
          : this.players['p1'];
      this.opponentName = this.player.opponentName;
      if (this.gameDetails['game_over'] === 'continue') {
        this.swapTurns();
      } else {
        this.player.thisPlayersTurn = false; this.gameOver = true; this.opponentFound = false; // Make sure no more moves can happen
        this.draw = this.gameDetails['game_over'] === "draw" ? true : false;
        this.listenForRematch();
      }
    });
    this.socket.unlockGameEmitter.subscribe((val) => {
      if (val['unlock'] === true) {
        const players = JSON.parse(val['players']);
        this.player.opponentName =
          this.player.playerNumber === 1 ? players['p2'] : players['p1'];
        this.opponentName = this.player.opponentName;
        this.opponentFound = true;
        if (this.playerNumber === 1) {
          this.toastr.success('Opponent Found!');
        }
      }
    });
    this.listenForMessages();
    this.listenForResignations();
    console.log(this.gameDetails['game_over']);
    if (this.gameDetails['game_over'] === 'win' || this.gameDetails['game_over'] === 'draw'){
      this.player.thisPlayersTurn = false; this.gameOver = true; this.opponentFound = false; // Make sure no more moves can happen
      this.draw = this.gameDetails['game_over'] === "draw" ? true : false;
      this.listenForRematch();
    } 
    this.doneLoading = true;
    this.toastr.success('Game joined Successfully');
  }

  getRoomDetails() {
    this.http.getRoomDetails(this.gameCode).subscribe(
      (res) => {
        if (res.status === 200) {
          this.gameDetails = JSON.parse(res.body);
          console.log(this.gameDetails['game_over']);
          if (this.gameDetails['turn'] === 1 && this.player.playerNumber === 1){
            this.player.thisPlayersTurn = true;
          } else if (this.gameDetails['turn'] === 2 && this.player.playerNumber === 2){
            this.player.thisPlayersTurn = true;
          } else {
            this.player.thisPlayersTurn = false;
          }
          this.chat = JSON.parse(this.gameDetails['chat']);
          this.loadBoard();
          this.connectToSocket();

            
        }
      },
      (error) => {
        console.log(error);
        this.router.navigate(['/']);
        this.toastr.error(
          'An error occurred whilst fetching room details, please try again'
        );
      }
    );
  }

  onJoinGame() {
    this.http
      .JoinGame(this.gameCode, this.playerName, this.gameCreator.toString())
      .subscribe(
        (res) => {
          if (res.status === 200) {
            const data: Object = JSON.parse(res.body);
            localStorage.setItem('rejoinCode', data['rejoin_code']);
            this.player.playerNumber = data['player_num'];
            this.playerNumber = this.player.playerNumber;
            this.player.playerPiece = this.player.playerNumber === 1 ? "X" : "O"; this.player.opponentPiece = this.player.playerNumber === 1 ? "O" : "X";
            this.playerPiece = this.player.playerPiece; this.opponentPiece = this.player.opponentPiece;
            this.getRoomDetails();
          }
        },
        (error) => {
          console.log(error);
          this.router.navigate(['/']);
          this.toastr.error(
            'An error occurred whilst trying to find this room, it may no longer exist'
          );
        }
      );
  }

  swapTurns() {
    if (this.gameDetails['turn'] === 1 && this.player.playerNumber === 1) {
      this.player.thisPlayersTurn = true;
    } else if (
      this.gameDetails['turn'] === 2 &&
      this.player.playerNumber === 2
    ) {
      this.player.thisPlayersTurn = true;
    } else {
      this.player.thisPlayersTurn = false;
    }
  }

  loadBoard() {
    const board = JSON.parse(this.gameDetails['board']);
    let row = 0;
    this.board = [[], [], []];
    board.forEach((element: number, index: number) => {
      this.board[row].push(element);
      if ((index + 1) % 3 === 0) {
        row++;
      }
    });
  }

  placePiece(event, x, y) {
    if ( event.srcElement.innerHTML.trim() === '' && this.player.thisPlayersTurn === true && this.opponentFound == true) {
      this.player.playerNumber === 1 ? (event.srcElement.innerHTML = 'X') : (event.srcElement.innerHTML = 'O');
      this.player.thisPlayersTurn = false;
      event.srcElement.style.color = event.srcElement.innerHTML === "X" ? 'lightblue' : 'orange';
      const serverData = JSON.stringify({
        game: this.gameCode,
        turn: this.player.playerNumber,
        position: [x, y],
      });
      this.socket.submitData(this.gameCode, serverData);
    }
  }

  voteForRematch() {
    this.rematchRequested = this.rematchRequested ? false : true;
    this.socket.voteForRematch(
      this.gameCode,
      this.playerNumber,
      this.rematchRequested
    );
  }

  listenForRematch() {
    this.socket.listenForRematch('open');
    this.listeningForRematch = true;
    this.rematchSubscription = this.socket.listenForRematchEmitter.subscribe(
      (val) => {
        if (val['rematch'] === false) {
          if (
            val['playerNumber'] !== this.playerNumber &&
            val['vote'] === true
          ) {
            this.opponentWantsRematch = true;
            this.chat.push('System: Your opponent wants a rematch!');
          } else if (val['vote'] === false) {
            this.opponentWantsRematch = false;
          }
        } else if (val['rematch'] === true) {
          this.rematchSubscription.unsubscribe();
          this.socket.listenForRematch('close');
          this.opponentWantsRematch = false;
          this.gameDetails = val['gameData'];
          this.players = this.gameDetails['players'];
          this.player.thisPlayersTurn =
            this.player.playerNumber === 1 ? false : true;
          this.player.playerNumber = this.player.playerNumber === 1 ? 2 : 1;
          this.playerNumber = this.player.playerNumber;
          this.player.opponentName =
            this.player.playerNumber === 1
              ? this.players['p2']
              : this.players['p1'];
          this.opponentName = this.player.opponentName;
          this.moveCounter = 0;
          this.player.playerPiece = this.player.playerPiece === "X" ? "O" : "X";
          this.player.opponentPiece = this.player.opponentPiece === "X" ? "O" : "X";
          this.playerPiece = this.player.playerPiece; this.opponentPiece =  this.player.opponentPiece;
          this.resigned = false;
          this.pressedResign = false;
          this.draw = false;
          localStorage.setItem(
            'rejoinCode',
            this.playerNumber === 1
              ? this.gameDetails['join_codes']['p1']
              : this.gameDetails['join_codes']['p2']
          );
          delete this.gameDetails['join_codes'];
          this.loadBoard();
          this.opponentFound = true;
          this.gameOver = false;
          this.rematchRequested = false;
          this.toastr.success('Rematch Successful');
        }
      }
    );
  }

  onSubmitName() {
    this.toastr.warning('Joining game...');
    this.playerName = this.player.firstLetterToUpper(this.nameForm.value.name);
    this.gameCreator = false;
    this.onJoinGame();
  }

  listenForMessages() {
    this.socket.listenForMessages.subscribe((val) => {
      if (val['author'] !== this.playerName) {
        this.chat.push(val['message']);
      }
    });
  }

  listenForResignations() {
    this.socket.listenForResignation.subscribe((val) => {
      if (val['resign'] === true) {
        this.player.thisPlayersTurn = false;
        this.gameOver = true;
        this.opponentFound = false;
        this.resigned = true; // Make sure no more moves can happen
        this.listenForRematch();
      }
    });
  }

  onSubmitMessage() {
    this.disableChat = true;
    this.socket.sendMessage(
      this.gameCode,
      this.chatForm.value.message,
      this.playerName
    );
    this.chat.push(`${this.playerName}: ${this.chatForm.value.message}`);
    this.chatForm.reset();
    this.disableChat = false;
  }

  onResign() {
    this.pressedResign = true;
    this.socket.announceResignation(this.gameCode);
  }

  copyGameToClipboard() {
    this.clipboard.copy(location.href);
    this.toastr.success('Game ID copied to clipboard!');
  }
}
