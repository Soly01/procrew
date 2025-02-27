import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasiclayoutComponent } from './basiclayout.component';

describe('BasiclayoutComponent', () => {
  let component: BasiclayoutComponent;
  let fixture: ComponentFixture<BasiclayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasiclayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasiclayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
