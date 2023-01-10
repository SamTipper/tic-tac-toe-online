import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  JoinGame(){
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/join-game",
      {
        observe: "response",
        responseType: "text"
      }
    )
  }

  createGame(){
    return this.http.get(
      "https://Tic-Tac-Toe-API.samtipper.repl.co/create-game",
      {
        observe: "response",
        responseType: "text"
      }
    )
  }
}
