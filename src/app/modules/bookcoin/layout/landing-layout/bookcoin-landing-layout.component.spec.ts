import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCoinLandingLayoutComponent } from './bookcoin-landing-layout.component';

describe('BookCoinLandingLayoutComponent', () => {
  let component: BookCoinLandingLayoutComponent;
  let fixture: ComponentFixture<BookCoinLandingLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookCoinLandingLayoutComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCoinLandingLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
