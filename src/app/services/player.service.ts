import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  playerName: string;
  opponentName: string;
  playerNumber: number;
  thisPlayersTurn: boolean;

  constructor(private http: HttpService) { }

  firstLetterToUpper(name){
    const splitName: string[] = name.split(" ");
    this.playerName = "";
    splitName.forEach(word => {
      this.playerName += `${word.charAt(0).toUpperCase() + word.substring(1)} `;
    })
    

    return this.playerName;
  }

  
}
