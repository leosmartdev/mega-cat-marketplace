import { TestBed } from '@angular/core/testing';
import { of as observableOf } from 'rxjs';

import { AchievementService } from './achievement.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AchievementService', () => {
  let service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [{ provide: AchievementService }]
    });
    service = TestBed.inject(AchievementService);
  });

  describe('get All achievement of a user', () => {
    it('should run #byUser()', async () => {
      service._httpClient = service._httpClient || {};
      spyOn(service._httpClient, 'post').and.returnValue(observableOf('post'));
      service.byUser();
      expect(service._httpClient.post).toHaveBeenCalled();
    });
  });

  describe('get All Achievements', () => {
    it('should run #getAll()', async () => {
      service._httpClient = service._httpClient || {};
      spyOn(service._httpClient, 'get');
      service.getAll();
      expect(service._httpClient.get).toHaveBeenCalled();
    });
  });

  describe('creat Achievement', () => {
    it('should run #create()', async () => {
      service._httpClient = service._httpClient || {};
      spyOn(service._httpClient, 'post').and.returnValue(observableOf('post'));
      service.create({
        title: 'This is a test Achievement',
        points: 300,
        userid: 'TestUser',
        nftId: 'TestNftID'
      });
      expect(service._httpClient.post).toHaveBeenCalled();
    });
  });

  describe('update an Achievement', () => {
    it('should run #update()', async () => {
      service._httpClient = service._httpClient || {};
      spyOn(service._httpClient, 'patch');
      service.update(
        {
          id: 'testAchievement'
        },
        {
          title: 'This is a test Achievement',
          points: 300
        }
      );
      expect(service._httpClient.patch).toHaveBeenCalled();
    });
  });
});
