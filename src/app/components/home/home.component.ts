import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PlayerService } from 'src/app/services/player.service';
import { HttpService } from 'src/app/services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  nameForm: FormGroup;

  constructor(private player: PlayerService, private http: HttpService, private router: Router) { }

  ngOnInit(){
    this.nameForm = new FormGroup({
      name: new FormControl(null, Validators.required)
    });
  }

  onSubmitName(){
    this.player.firstLetterToUpper(this.nameForm.value.name);
    this.http.createGame(this.player.playerName).subscribe(
      (res) => {
        if (res.status === 201){
          const body: Object = JSON.parse(res.body);
          localStorage.setItem("rejoinCode", body['rejoin_code']);
          this.player.playerNumber = 1;
          this.router.navigate(['game', body['room_num']]);
        }
      })
  }

}
