import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JoinOrCreateTeamComponent } from './join-or-create-team.component';

describe('JoinOrCreateTeamComponent', () => {
  let component: JoinOrCreateTeamComponent;
  let fixture: ComponentFixture<JoinOrCreateTeamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinOrCreateTeamComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JoinOrCreateTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
