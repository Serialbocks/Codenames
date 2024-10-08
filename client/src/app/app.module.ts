import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorDialogComponent } from './views/error-dialog/error-dialog.component';
import { LobbyComponent } from './views/lobby/lobby.component';
import { MaterialModule } from './material-module';
import { NewGameDialogComponent } from './views/new-game-dialog/new-game-dialog.component';
import { GameComponent } from './views/game/game.component';

@NgModule({
  declarations: [
    AppComponent,
    ErrorDialogComponent,
    LobbyComponent,
    NewGameDialogComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorDialogComponent,
    NewGameDialogComponent
  ]
})
export class AppModule { }
