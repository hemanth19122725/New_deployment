import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeployComponent } from './view-deploy.component';

describe('ViewDeployComponent', () => {
  let component: ViewDeployComponent;
  let fixture: ComponentFixture<ViewDeployComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewDeployComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDeployComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
