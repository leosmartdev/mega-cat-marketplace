import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropsComponent } from './drops.component';

describe('DropsComponent', () => {
  let component: DropsComponent;
  let fixture: ComponentFixture<DropsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
