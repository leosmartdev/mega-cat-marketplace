import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletConnectComponent } from './wallet-connect.component';
import { WalletService } from 'app/core/wallet/wallet.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';

describe('WalletConnectComponent', () => {
  let component: WalletConnectComponent;
  let fixture: ComponentFixture<WalletConnectComponent>;

  beforeEach(async () => {
    const walletServiceMock = jasmine.createSpyObj('WalletService', ['']);
    const routerMock = jasmine.createSpyObj('Router', ['']);
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [WalletConnectComponent],
      providers: [{ provide: WalletService, useValue: walletServiceMock }, { provide: Router, useValue: routerMock }, { provide: HttpClient }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
