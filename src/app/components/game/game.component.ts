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
  currentRoute: number;

  constructor(private route: ActivatedRoute,
              private http: HttpService,
              private player: PlayerService ) {

    this.route.params.subscribe((params) => {
      this.currentRoute = params['id'];
    });
  }

  ngOnInit(){
    
  }

  

}
