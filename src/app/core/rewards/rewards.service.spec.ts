import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { Reward } from './rewards';
import { environment } from 'environments/environment';
import { RewardsService } from './rewards.service';

const baseUrl = environment.apiUrl;

describe('RewardsService', () => {
  let service: RewardsService;
  let httpTestingController: HttpTestingController;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuthHeader']);
  const mockedReward: Reward = {
    id: '10',
    title: 'Test-10',
    markdown: 'Test',
    isActive: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [HttpClient, { provide: AuthService, useValue: authServiceMock }]
    });
    service = TestBed.inject(RewardsService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('CreateReward', () => {
    it('should create a reward correctly', () => {
      const url = `${baseUrl}/rewards`;
      const data = new FormData();
      data.append('markdown', mockedReward.markdown);
      data.append('title', mockedReward.title);

      service.createReward(data).subscribe((res) => {
        expect(res).toEqual(mockedReward);
      });

      const requestWrapper = httpTestingController.expectOne({ url });
      expect(requestWrapper.request.method).toEqual('POST');
      requestWrapper.flush(mockedReward);
      httpTestingController.verify();
    });

    it('should throw an error if markdown is not present', () => {
      const data = new FormData();
      data.append('title', mockedReward.title);

      expect(() => service.createReward(data).subscribe()).toThrowError('Reward markdown is not present');
    });

    it('should throw an error if title is not present', () => {
      const data = new FormData();
      data.append('markdown', mockedReward.markdown);

      expect(() => service.createReward(data).subscribe()).toThrowError('Reward title is not present');
    });
  });
});
