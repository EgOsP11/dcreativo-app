import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TareaModalPage } from './tarea-modal.page';

describe('TareaModalPage', () => {
  let component: TareaModalPage;
  let fixture: ComponentFixture<TareaModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TareaModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
