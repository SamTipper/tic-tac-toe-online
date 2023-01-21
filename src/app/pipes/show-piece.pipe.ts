import { Pipe, PipeTransform } from '@angular/core';
import { PlayerService } from '../services/player.service';

@Pipe({
  name: 'showPiece'
})
export class ShowPiecePipe implements PipeTransform {

  constructor(private player: PlayerService){}

  transform(value: string, playerNum: number) {

    if (this.player.playerNumber === 1 && value === this.player.playerName){
      return `${this.player.playerName}: X`
    }
    else if (this.player.playerNumber === 1 && value !== this.player.playerName){
      return `${this.player.opponentName}: O`
    }
    else if (this.player.playerNumber === 2 && value === this.player.playerName){
      return `${this.player.playerName}: O`
    }
    else if (this.player.playerNumber === 2 && value !== this.player.playerName){
      return `${this.player.opponentName}: X`
    }
    return null;
  }

}
