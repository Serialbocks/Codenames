import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  private socket;

  constructor() { 
  }

  setupSocketConnection() {
    this.socket = io(window.location.href);
  }
}
