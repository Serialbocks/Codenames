import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  public socket;
  public currentRoom: string;

  constructor() { 
  }

  setupSocketConnection() {
    this.socket = io(window.location.href);
  }

  changeUsername(username) {
    this.socket.emit('change_username', username);
  }
}
