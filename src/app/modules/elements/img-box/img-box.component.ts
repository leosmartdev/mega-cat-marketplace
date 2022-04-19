import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-img-box',
  templateUrl: './img-box.component.html',
  styleUrls: ['./img-box.component.scss']
})
export class ImgBoxComponent implements OnInit {
  @Input() properties;
  constructor() {}

  ngOnInit(): void {}
}
