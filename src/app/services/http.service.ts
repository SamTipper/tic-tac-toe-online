import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  JoinGame(gameCode, playerName, isGameCreator){
    const joinCode = localStorage.getItem("rejoinCode") !== null ? localStorage.getItem("rejoinCode") : "";
    console.log(isGameCreator);
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/join-game",
      {
        headers: {"roomCode": gameCode,"player": playerName, "joinCode": joinCode, "isGameCreator": isGameCreator},
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

  getRoomCreator(gameCode){
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/is-room-creator",
      {
        headers: {"roomCode": gameCode, "rejoinCode": localStorage.getItem("rejoinCode")},
        observe: "response",
        responseType: "text"
      }
    )
  }
  
}
