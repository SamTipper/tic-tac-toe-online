import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  playerName: string;
  playerNumber: number;
  thisPlayersTurn: boolean;

  constructor() { }

  firstLetterToUpper(name){
    const splitName: string[] = name.split(" ");
    this.playerName = "";
    splitName.forEach(word => {
      this.playerName += `${word.charAt(0).toUpperCase() + word.substring(1)} `;
    })

    return this.playerName;
  }
}
