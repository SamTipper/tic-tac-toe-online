import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  JoinGame(gameCode, playerName){
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/join-game",
      {
        headers: {"roomCode": gameCode,"p2": playerName},
        observe: "response",
        responseType: "text"
      }
    )
  }

  createGame(name){
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/create-game",
      {
        headers: {"p1": name},
        observe: "response",
        responseType: "text"
      }
    )
  }

  getRoomDetails(gameCode){
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/get-room-details",
      {
        headers: {"roomCode": gameCode},
        observe: "response",
        responseType: "text"
      }
    )
  }
  
}
