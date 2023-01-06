import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  nameForm: FormGroup;

  ngOnInit(){
    this.nameForm = new FormGroup({
      name: new FormControl(null, Validators.required)
    });
  }

  onSubmitName(){
    localStorage.setItem("name", this.nameForm.value.name);
  }

}
