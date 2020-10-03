import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public session: any;
  public username: string;
  public chatMessages: string = "";
  public rowIndexes = [0, 1, 2, 3, 4];
  @ViewChild('chatMessageContainer', { static: false }) private chatMessageDiv: ElementRef;

  constructor(private ioService: SocketioService) { }

  ngOnInit() {
    this.username = this.ioService.username;

    this.ioService.socket.on('chat_message', (message) => {
      this.chatMessages += message + '\n';
      setTimeout(() => {
        this.chatMessageDiv.nativeElement.scrollTop = this.chatMessageDiv.nativeElement.scrollHeight;
      }, 100);
      
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
    let isCzar = this.username == this.session.redCzar || this.username == this.session.blueCzar;
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
