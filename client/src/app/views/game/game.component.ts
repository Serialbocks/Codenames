import { Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public session: any;
  public username: string;
  public rows = [1, 2, 3, 4, 5];

  private storage: Storage;

  constructor(private ioService: SocketioService) { }

  ngOnInit() {
    this.storage = window.localStorage;
    this.username = this.storage.getItem('username');
    this.ioService.socket.on('update_session_state', (session) => {
      this.session = session;
      console.log(session);
    });
    this.ioService.socket.emit('request_session_state');
  }

  randomizeTeams() {
    this.ioService.socket.emit('randomize_teams');
  }

  newGame() {
    this.ioService.socket.emit('new_game');
  }

}
