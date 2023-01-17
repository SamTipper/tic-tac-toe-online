import { EventEmitter, Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket;
  dataEmitter = new EventEmitter<Object>();
  unlockGameEmitter = new EventEmitter<Object>();
  listenForRematchEmitter = new EventEmitter<Object>();

  constructor() { }

  connectToSocket(){
    this.socket = io("https://Tic-Tac-Toe-API.samtipper.repl.co");
  }

  joinRoom(gameCode: string, playerNumber: number, playerName: string){
    this.socket.emit('join', {"room": gameCode, "playerNumber": playerNumber, "playerName": playerName});
  }

  leaveRoom(gameCode: string) { // TODO

  }

  voteForRematch(gameCode: string, playerNumber: number, vote: boolean){
    this.socket.emit('rematch-vote', {"room": gameCode, "playerNumber": playerNumber, "vote": vote})
  }

  submitData(gameCode: string, data: string){
    this.socket.emit('submit-data', {"room": gameCode, "data": data});
  }

  activateListeners(){
    this.socket.addEventListener('message', ev => {
      this.dataEmitter.emit(JSON.parse(ev));
    })

    this.socket.addEventListener('unlock-game', ev => {
      this.unlockGameEmitter.emit(JSON.parse(ev));
    })
  }

  listenForRematch(gate: string){
    if (gate === 'open'){
      this.socket.addEventListener('rematchVoteServerEvent', ev => {
        this.listenForRematchEmitter.emit(ev);
      })
    } else if (gate === 'close'){
      this.socket.removeEventListener('rematchVoteServerEvent');
    }
    
  }


}
