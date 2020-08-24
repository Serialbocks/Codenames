import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {
  public text;

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.text = data.text;
   }

  ngOnInit() {
  }

}
