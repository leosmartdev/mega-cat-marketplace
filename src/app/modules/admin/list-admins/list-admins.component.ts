import { Component, OnInit } from '@angular/core';
import { ProductService } from 'app/core/product/product.service';
import { RolesService } from 'app/core/roles/roles.service';
import { Product } from 'app/core/product/product';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Role } from 'app/core/models/role';
@Component({
  selector: 'app-list-admins',
  templateUrl: './list-admins.component.html',
  styleUrls: ['./list-admins.component.scss']
})
export class ListAdminsComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'action'];
  configForm: FormGroup;
  id: number;
  nfts: any[] = [];
  users: any[] = [];
  page: number = 1;
  username: string = null;
  formFieldHelpers: string[] = [''];
  createAdminForm: FormGroup;

  constructor(private roleSerivce: RolesService, private _activatedRoute: ActivatedRoute, private _router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.roleSerivce.listAdmins().subscribe((data: any) => {
      this.users = data.users;
    });
  }

  makeUser(obj) {
    if (obj !== null) {
      this.roleSerivce
        .revokeAdminRole({
          userName: obj
        })
        .subscribe(() => {
          //redirect
          const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/dashboard';

          // Navigate to the redirect url
          this._router.navigateByUrl(redirectURL);
        });
    }
  }
  isSuperAdmin(): boolean {
    if (this.authService.user && this.authService.user.role === Role.SuperUser) {
      return true;
    } else {
      return false;
    }
  }
}
