import { Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  public usernameEdit: string;
  public username: string;
  public usernameUpdatedText: string;
  public showUsernameNotification: boolean = true;
  public gameSessions: any[];
  private storage: Storage;

  constructor(private ioService: SocketioService) { 

  }

  ngOnInit() {
    this.ioService.socket.on('username_changed', () => {
      this.username = this.usernameEdit;
      this.storage.setItem('username', this.username);
      if(this.showUsernameNotification) {
        this.usernameUpdatedText = "Username updated!";
        setTimeout(() => {this.usernameUpdatedText = '';}, 3000);
      }
      this.showUsernameNotification = true;
    });

    this.ioService.socket.on('username_unchanged', () => {
      this.usernameEdit = this.username;
      this.showUsernameNotification = true;
    });

    this.storage = window.localStorage;
    this.usernameEdit = this.storage.getItem('username');

    if(this.usernameEdit) {
      this.showUsernameNotification = false;
      this.updateUsername();
    }
  }

  updateUsername() {
    if(this.username == this.usernameEdit) return;
    this.ioService.changeUsername(this.usernameEdit);
  }

}
