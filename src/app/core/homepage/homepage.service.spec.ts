import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HomepageService } from './homepage.service';
import { environment } from 'environments/environment';

const baseUrl = environment.apiUrl;

describe('HomepageService', () => {
  let service: HomepageService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [{ provide: HomepageService }]
    });
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.inject(HomepageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get drops', () => {
    const url = `${baseUrl}/drops/`;
    const expectedResponse = {
      status: 200,
      data: {
        cards: []
      }
    };

    service.getDrops().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get news', () => {
    const url = `${baseUrl}/news/index/`;
    const expectedResponse = {
      status: 200,
      data: {
        newsLetter: []
      }
    };

    service.getNews().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get team', () => {
    const url = `${baseUrl}/teams/index/`;
    const expectedResponse = {
      status: 200,
      data: {
        Bcards: []
      }
    };

    service.getTeam().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });

  it('should get FAQs', () => {
    const url = `${baseUrl}/faqs/index/`;
    const expectedResponse = {
      status: 200,
      data: {
        faqs: []
      }
    };

    service.getFAQ().subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });

    const requestWrapper = httpTestingController.expectOne({ url });
    expect(requestWrapper.request.method).toEqual('GET');
    requestWrapper.flush(expectedResponse);
    httpTestingController.verify();
  });
});
