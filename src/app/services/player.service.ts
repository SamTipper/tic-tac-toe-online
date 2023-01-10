import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  playerName: string;
  playerNumber: number;
  thisPlayersTurn: boolean;

  constructor() { }
}
