import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PlayerService } from 'src/app/services/player.service';
import { HttpService } from 'src/app/services/http.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  nameForm: FormGroup;
  joiningGame: boolean = false;

  constructor(private player: PlayerService, private http: HttpService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(){
    this.nameForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.maxLength(10)])
    });
  }

  onSubmitName(){
    this.joiningGame = true;
    this.toastr.warning("Joining game...");
    this.player.firstLetterToUpper(this.nameForm.value.name);
    this.nameForm.reset();
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
