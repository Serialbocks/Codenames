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
  public cardSelectedMessages: string[] = [];
  public rows = [0, 1, 2, 3, 4];

  private storage: Storage;

  constructor(private ioService: SocketioService) { }

  ngOnInit() {
    this.storage = window.localStorage;
    this.username = this.ioService.username;

    this.ioService.socket.on('user_selected', (message) => {
      if(this.cardSelectedMessages.indexOf(message) >= 0) {
        return;
      }

      this.cardSelectedMessages.push(message);
      setTimeout(() => {
        let index = this.cardSelectedMessages.indexOf(message);
        if(index >= 0) {
          this.cardSelectedMessages.splice(index, 1);
        }
      }, 5000);
    });

    this.ioService.socket.on('update_session_state', (session) => {
      this.session = session;
    });
    this.ioService.socket.emit('request_session_state');
  }

  randomizeTeams() {
    this.ioService.socket.emit('randomize_teams');
  }

  newGame() {
    this.ioService.socket.emit('new_game');
  }

  cardClicked(index) {
    let isCzar = this.username == this.session.redTeam[0] || this.username == this.session.blueTeam[0];
    if(isCzar) {
      this.ioService.socket.emit('reveal_card', index);
    } else {
      this.ioService.socket.emit('select_card', index);
    }
  }

  makeCzar(username, color) {
    let isHost = this.username == this.session.host;
    if(isHost) {
      this.ioService.socket.emit('make_user_czar', {username: username, team: color});
    }
  }

}
