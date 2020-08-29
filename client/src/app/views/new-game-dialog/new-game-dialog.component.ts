import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-new-game-dialog',
  templateUrl: './new-game-dialog.component.html',
  styleUrls: ['./new-game-dialog.component.scss']
})
export class NewGameDialogComponent implements OnInit {
  public roomName: string;
  public useCustomWords: boolean;
  public customWords: string;
  public customWordFrequency: number = 50;
  public errorText: string;

  private storage: Storage;

  constructor(public dialogRef: MatDialogRef<NewGameDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { 

  }

  ngOnInit() {
    this.storage = window.localStorage;

    let customWords = this.storage.getItem("custom-words");
    if(customWords) {
      this.customWords = customWords;
    }
    let customWordFrequency = this.storage.getItem("custom-word-frequency");
    if(customWordFrequency) {
       try {this.customWordFrequency = parseInt(customWordFrequency);}
       catch {}
    }
    let useCustomWords = this.storage.getItem("use-custom-words");
    if(useCustomWords) {
      this.useCustomWords = useCustomWords == "true";
    }
    let roomName = this.storage.getItem('room-name');
    if(roomName) {
      this.roomName = roomName;
    }
  }

  saveRoomName() {
    if(this.roomName) {
      this.storage.setItem('room-name', this.roomName);
    }
  }

  saveCustomWords() {
    if(this.customWords) {
      this.storage.setItem("custom-words", this.customWords);
    }
  }

  sliderChanged(event) {
    this.customWordFrequency = event.value;
    this.storage.setItem("custom-word-frequency", JSON.stringify(this.customWordFrequency));
  }

  checkboxChanged() {
    this.storage.setItem("use-custom-words", JSON.stringify(this.useCustomWords));
  }

  createGame() {
    this.errorText = "";
    let isValid = true;

    if(!this.roomName || this.roomName.length == 0) {
      this.errorText += "Please enter a room name. ";
      isValid = false;
    }
    
    if(this.useCustomWords && (!this.customWords || this.customWords.length == 0)) {
      this.errorText += "Please enter one or more custom words separated by lines.";
      isValid = false;
    }

    if(!isValid) return;

    let customWords = null;
    if(this.useCustomWords) {
      customWords = this.customWords.split("\n");
      let index = customWords.indexOf("");
      while(index >= 0) {
        customWords.splice(index, 1);
        index = customWords.indexOf("");
      }
    }

    this.dialogRef.close({
      roomName: this.roomName,
      customWords: customWords,
      customWordFrequency: this.customWordFrequency
    });
  }

}
