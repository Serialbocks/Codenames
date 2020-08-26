import { Component } from '@angular/core';
import { SocketioService } from './services/socketio.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './views/error-dialog/error-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public username: string;
  public currentPage: string = "lobby";

  constructor(private ioService: SocketioService, private dialog: MatDialog) {
    
  }

  ngOnInit() {
    this.ioService.setupSocketConnection();

    // Handle all error messages from the server
    this.ioService.socket.on('error_msg', (msg) => {
      this.dialog.open(ErrorDialogComponent, { 
        data: {
          text: msg
        },
        width: '450px'
      });
    });

    this.ioService.socket.on('enter_game_session', (roomName) => {
      this.ioService.currentRoom = roomName;
      this.currentPage = "game";
    });
  }

}
