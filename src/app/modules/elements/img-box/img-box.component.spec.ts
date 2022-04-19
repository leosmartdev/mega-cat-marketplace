import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgBoxComponent } from './img-box.component';

describe('ImgBoxComponent', () => {
  let component: ImgBoxComponent;
  let fixture: ComponentFixture<ImgBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImgBoxComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
