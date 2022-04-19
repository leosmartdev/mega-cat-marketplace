import { AuthService } from 'app/core/auth/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
  styleUrls: ['./deploy.component.scss']
})
export class DeployComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }
}
