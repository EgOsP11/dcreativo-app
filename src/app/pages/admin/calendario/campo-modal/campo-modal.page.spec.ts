import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampoModalPage } from './campo-modal.page';

describe('CampoModalPage', () => {
  let component: CampoModalPage;
  let fixture: ComponentFixture<CampoModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CampoModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
