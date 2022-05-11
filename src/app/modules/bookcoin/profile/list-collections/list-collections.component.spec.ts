import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorsService } from 'app/core/errors/errors.service';
import { ProductService } from 'app/core/product/product.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { of } from 'rxjs';

import { ListCollectionsComponent } from './list-collections.component';

describe('ListCollectionsComponent', () => {
  let component: ListCollectionsComponent;
  let fixture: ComponentFixture<ListCollectionsComponent>;

  const productServiceMock = jasmine.createSpyObj('ProductService', ['getAllCollections']);
  const errorsServiceMock = jasmine.createSpyObj('ErrorsService', ['openSnackBar']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);

  productServiceMock.getAllCollections.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxPaginationModule],
      declarations: [ListCollectionsComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: ErrorsService, useValue: errorsServiceMock },
        { provide: Router, useValue: routerMock },
        FormBuilder
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
