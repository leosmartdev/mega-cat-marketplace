import { Component } from '@angular/core';
import { RouteMonitorService } from './shared/route-monitor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /**
   * Constructor
   */
  constructor(private routeMonitorService: RouteMonitorService) {}
}
