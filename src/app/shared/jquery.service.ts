import { Injectable } from '@angular/core';
import * as $ from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class JQueryService {
  constructor() {}

  execute(lambda): void {
    lambda($);
  }

  resizeTextarea(event: any) {
    const target = event.target;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  }

  /** helper method to make any textareas in view dynamically resizable. */
  setDynamicTextareas(selector: string = 'textarea') {
    const lambda = () => {
      $(selector)
        .each(function () {
          this.setAttribute('style', 'height:' + this.scrollHeight + 'px;overflow-y:hidden;');
        })
        .on('input', function () {
          this.style.height = 'auto';
          this.style.height = this.scrollHeight + 'px';
        });
    };

    this.execute(lambda);
  }
}
