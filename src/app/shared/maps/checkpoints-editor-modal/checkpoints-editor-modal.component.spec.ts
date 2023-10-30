import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CheckpointsEditorModalComponent } from './checkpoints-editor-modal.component';

describe('CheckpointsEditorModalComponent', () => {
  let component: CheckpointsEditorModalComponent;
  let fixture: ComponentFixture<CheckpointsEditorModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckpointsEditorModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckpointsEditorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
