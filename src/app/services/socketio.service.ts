import { EventEmitter, Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket;
  dataEmitter = new EventEmitter<Object>();
  unlockGameEmitter = new EventEmitter<Object>();

  constructor() { }

  connectToSocket(){
    this.socket = io("https://Tic-Tac-Toe-API.samtipper.repl.co");
  }

  joinRoom(gameCode, playerNumber, playerName){
    this.socket.emit('join', {"room": gameCode, "playerNumber": playerNumber, "playerName": playerName});
  }

  submitData(gameCode, data){
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


}
