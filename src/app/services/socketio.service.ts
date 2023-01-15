import { EventEmitter, Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket;
  socketListener;
  gameData: Object;
  dataEmitter = new EventEmitter<Object>();

  constructor() { }

  connectToSocket(){
    this.socket = io("https://Tic-Tac-Toe-API.samtipper.repl.co");
  }

  joinRoom(gameCode){
    this.socket.emit('join', {"room": gameCode});
  }

  submitData(gameCode, data){
    this.socket.emit('submit-data', {"room": gameCode, "data": data});
  }

  activateListeners(){
    this.socket.addEventListener('message', ev => {
      this.dataEmitter.emit(JSON.parse(ev));
    })
  }


}
