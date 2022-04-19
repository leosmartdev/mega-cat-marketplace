import { TestBed } from '@angular/core/testing';

import { RolesService } from './roles.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'environments/environment';
import { AuthService } from '../auth/auth.service';

const baseUrl = environment.apiUrl;

describe('RolesService', () => {
  let service: RolesService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['accessToken', 'getAuthHeader'], ['get']);
    authServiceMock.accessToken.and.callThrough();

    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }]
    });
    service = TestBed.inject(RolesService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the list the Users', (done) => {
    const testUrl = `${baseUrl}/role/getUsers/`;
    const expectedResponse = {
      users: []
    };
    const data = {
      userName: 'test@123',
      role: 'Admin'
    };

    service.listUsers(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });
    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should make a user admin', (done) => {
    const testUrl = `${baseUrl}/role/admin`;
    const expectedResponse = {
      user: {
        userName: 'test@123',
        role: 'Admin'
      }
    };
    const data = {
      userName: 'test@123',
      role: 'User'
    };

    service.makeAdmin(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });
    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should revoke an admin role', (done) => {
    const testUrl = `${baseUrl}/role/user`;
    const expectedResponse = {
      user: {
        userName: 'test@123',
        role: 'User'
      }
    };
    const data = {
      userName: 'test@123',
      role: 'Admin'
    };

    service.revokeAdminRole(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get the list of admins', (done) => {
    const testUrl = `${baseUrl}/role/getAdmins`;
    const expectedResponse = {
      user: {
        users: []
      }
    };

    service.listAdmins().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get the pending payouts', (done) => {
    const testUrl = `${baseUrl}/payouts/pending`;
    const expectedResponse = {
      payouts: [],
      filteredPayouts: [],
      nfts: [],
      users: [],
      page: 1
    };

    service.getPendingPayouts().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should approve a payout', (done) => {
    const testUrl = `${baseUrl}/payouts/approve`;
    const data = {
      payoutId: '123'
    };

    const expectedResponse = {
      status: 200
    };

    service.approvePayout(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get the payout by providing wallet address', (done) => {
    const testUrl = `${baseUrl}/payouts/walletAddress`;
    const data = {
      walletAdress: 'Test address'
    };
    const expectedResponse = {
      payouts: []
    };

    service.getPayoutsByWalletAddress(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get the user balance by providing wallet address', (done) => {
    const testUrl = `${baseUrl}/payouts/getBalance`;
    const expectedResponse = {
      status: 200,
      balance: 1000
    };

    service.getUserBalanceByWalletAddress().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should approve all payouts', (done) => {
    const testUrl = `${baseUrl}/payouts/approveAllPayouts`;
    const data = [{ payoutId: '123' }, { payoutId: '456' }];
    const expectedResponse = {
      status: 200,
      payouts: []
    };

    service.approveAllPayouts(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should transfer balance to user wallet', (done) => {
    const testUrl = `${baseUrl}/payouts/transferCircleToUserWallet`;
    const data = {
      walletAdress: 'Test address'
    };
    const expectedResponse = {
      status: 200
    };

    service.transferBalanceToUserMetamaskWallet(data).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
      done();
    });

    const requestWrapper = httpTestingController.expectOne({ url: testUrl });
    expect(requestWrapper.request.method).toEqual('POST');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });
});
