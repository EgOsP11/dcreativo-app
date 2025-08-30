import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrabajadorPage } from './trabajador.page';

describe('TrabajadorPage', () => {
  let component: TrabajadorPage;
  let fixture: ComponentFixture<TrabajadorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrabajadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
