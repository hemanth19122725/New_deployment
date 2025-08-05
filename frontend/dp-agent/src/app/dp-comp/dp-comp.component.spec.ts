import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DpCompComponent } from './dp-comp.component';

describe('DpCompComponent', () => {
  let component: DpCompComponent;
  let fixture: ComponentFixture<DpCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DpCompComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DpCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
