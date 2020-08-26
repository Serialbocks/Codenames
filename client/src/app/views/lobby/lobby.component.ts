import { Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';
import { MatDialog } from '@angular/material/dialog';
import { NewGameDialogComponent } from '../new-game-dialog/new-game-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

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

  constructor(private ioService: SocketioService, private dialog: MatDialog) { 

  }

  ngOnInit() {
    // Handle username changed events
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
    this.ioService.socket.on('update_session_list', (sessions) => {
      this.gameSessions = sessions;
      console.log(sessions);
    });

    this.storage = window.localStorage;
    this.usernameEdit = this.storage.getItem('username');

    if(this.usernameEdit) {
      this.showUsernameNotification = false;
      this.updateUsername();
    }

    this.ioService.socket.emit('request_sessions');
  }

  updateUsername() {
    if(this.username == this.usernameEdit) return;
    this.ioService.changeUsername(this.usernameEdit);
  }

  newGame() {
    if(!this.username || this.username.length == 0) {
      this.dialog.open(ErrorDialogComponent, {
        data: {text: "Please enter a username before creating a game."},
        width: '450px'
      });
      return;
    }

    let dialogResult = this.dialog.open(NewGameDialogComponent, {
      data: {},
      width: '500px'
    });

    dialogResult.afterClosed().subscribe((value) => {
      if(!value) return;

      this.ioService.socket.emit('create_new_session', value);
    });
  }

  joinSession(session) {
    if(!this.username || this.username.length == 0) {
      this.dialog.open(ErrorDialogComponent, {
        data: {text: "Please enter a username before joining a game."},
        width: '450px'
      });
      return;
    }
    this.ioService.socket.emit('join_session', session.roomName);
  }

}
