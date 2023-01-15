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
    const headers = {"roomCode": gameCode}
    if (localStorage.getItem("rejoinCode") !== null){
      headers['rejoinCode'] = localStorage.getItem("rejoinCode");
    }
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/get-room-details",
      {
        headers: headers,
        observe: "response",
        responseType: "text"
      }
    )
  }

  getPlayerNumOnRejoin(gameCode){
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/get-player-number",
      {
        headers: {"roomCode": gameCode, "rejoinCode": localStorage.getItem("rejoinCode")},
        observe: "response",
        responseType: "text"
      }
    )
  }
  
}
