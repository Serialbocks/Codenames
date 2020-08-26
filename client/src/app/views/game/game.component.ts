import { Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(private ioService: SocketioService) { }

  ngOnInit() {
    this.ioService.socket.on('update_session_state', (session) => {
      console.log(session);
    });
    this.ioService.socket.emit('request_session_state');
  }

}
