import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  public socket: any;
  public currentRoom: string;
  public username: string;

  constructor() { }

  setupSocketConnection() {
    this.socket = io(window.location.host, {path: '/codenames/socket.io' });
  }

  changeUsername(username) {
    this.socket.emit('change_username', username);
  }
}
