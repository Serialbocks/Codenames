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
  private storage: Storage;

  constructor(private ioService: SocketioService) { 

  }

  ngOnInit() {
    this.ioService.socket.on('username_changed', () => {
      this.username = this.usernameEdit;
      this.storage.setItem('username', this.username);
    });

    this.ioService.socket.on('username_unchanged', () => {
      this.usernameEdit = this.username;
    });

    this.storage = window.localStorage;
    this.usernameEdit = this.storage.getItem('username');
    this.username = this.usernameEdit;

    if(this.username) {
      this.updateUsername();
    }
  }

  updateUsername() {
    this.ioService.changeUsername(this.usernameEdit);
  }

}
