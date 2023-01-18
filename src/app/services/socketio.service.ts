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
  listenForMessages = new EventEmitter<Object>();
  listenForResignation = new EventEmitter<Object>();

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

  sendMessage(gameCode: string, message: string, playerName: string){
    this.socket.emit('send-message', {"room": gameCode, "message": `${playerName}: ${message}`, "playerName": playerName});
  }

  announceResignation(gameCode: string){
    this.socket.emit('player-resigned', {"room": gameCode});
  }

  activateListeners(){
    this.socket.addEventListener('message', ev => {
      this.dataEmitter.emit(JSON.parse(ev));
    })

    this.socket.addEventListener('unlock-game', ev => {
      this.unlockGameEmitter.emit(JSON.parse(ev));
    })

    this.socket.addEventListener('new-chat-message', ev => {
      this.listenForMessages.emit(ev);
    })

    this.socket.addEventListener('player-resignation', ev => {
      this.listenForResignation.emit(ev);
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
