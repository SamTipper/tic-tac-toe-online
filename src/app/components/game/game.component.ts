import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from 'src/app/services/http.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  playerName: string;
  nameForm: FormGroup;
  gameCode: number;
  gameCodeSubscriber: Subscription;
  gameDetails: Object;
  board = [[], [], []];
  gameOver: boolean = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private http: HttpService,
              private player: PlayerService ) {

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
      && localStorage.getItem("rejoinCode") === undefined){ // Join from link
      this.player.playerNumber = 2;
      this.onJoinGame();

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
        if (this.gameDetails['locked'] === false){

          if (this.gameDetails['turn'] === 1 && this.player.playerNumber === 1){
            this.player.thisPlayersTurn = true;
          } else if (this.gameDetails['turn'] === 2 && this.player.playerNumber === 2){
            this.player.thisPlayersTurn = true;
          } else {
            this.player.thisPlayersTurn = false;
          }
          this.loadBoard();
        }
        
      } else {
        this.router.navigate([""]);
      }
      })
    
    if (this.gameCode !== undefined){
      this.gameCodeSubscriber.unsubscribe();
    }
    
  }

  onJoinGame(){
    this.http.JoinGame(this.gameCode).subscribe(
      (res) => {
        if (res.status === 200){

        }
      })
  }

  loadBoard(){
    const board = JSON.parse(this.gameDetails['board']);
    let row = 0;
    board.forEach((element: number, index: number) => {
      this.board[row].push(element);
      if ((index+1) % 3 === 0){
        row++;
      }
    });
    console.log(JSON.stringify(this.board))
  }

  placePiece(event){
    if (event.srcElement.innerHTML.trim() === "" ){ // && this.player.thisPlayersTurn === true
      this.player.playerNumber === 1 ? event.srcElement.innerHTML = "X" : event.srcElement.innerHTML = "O";
      // this.player.thisPlayersTurn = false;
      this.player.playerNumber === 1 ? this.player.playerNumber = 2 : this.player.playerNumber = 1;
    }
    
  }

  onSubmitName(){
    this.playerName = this.nameForm.value.name;
  }

}
