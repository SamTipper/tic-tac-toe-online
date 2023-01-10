import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  gameCode: number;

  constructor(private route: ActivatedRoute,
              private http: HttpService,
              private player: PlayerService ) {

    this.route.params.subscribe((params) => {
      this.gameCode = params['id'];
    });
  }

  ngOnInit(){
    if (this.player.playerNumber === undefined && localStorage.getItem("rejoinCode") === undefined){ // Join from link
      this.player.playerNumber = 2;
    } else if (this.player.playerNumber !== undefined && localStorage.getItem("rejoinCode") !== undefined){ // Join from game creation
      this.player.playerNumber = 1;
    }else if (this.player.playerNumber == undefined && localStorage.getItem("rejoinCode") !== undefined){ // Join from link
      this.player.playerNumber = 2;
    }
    console.log(this.player.playerNumber);
  }

  loadBoard(){

  }

  placePiece(event){
    if (event.srcElement.innerHTML === "" && this.player.thisPlayersTurn === false){
      if (this.player.playerNumber === 1){
        event.srcElement.innerHTML = "X";
      } else {
        event.srcElement.innerHTML = "O";
      }
      this.player.thisPlayersTurn = false;
    }
    
  }

}
