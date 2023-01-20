import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pieceColor'
})
export class PieceColorPipe implements PipeTransform {

  transform(value: any, ...args: any[]): unknown {
    if (value !== ""){
      args[0].style.color = value === "X" ? 'lightblue' : 'orange';
      return value;
    }
    return null;
  }

}
