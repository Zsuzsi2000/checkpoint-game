import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {IonInput, IonToggle, ModalController} from "@ionic/angular";
import {Checkpoint} from "../../../models/checkpoint.model";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Coordinates, Location} from "../../../interfaces/Location";
import {Quiz} from "../../../interfaces/Quiz";
import {LocationType} from "../../../enums/LocationType";
import {ImageService} from "../../../services/image.service";

@Component({
  selector: 'app-checkpoint-editor',
  templateUrl: './checkpoint-editor.component.html',
  styleUrls: ['./checkpoint-editor.component.scss'],
})
export class CheckpointEditorComponent implements OnInit {

  @ViewChild('newAnswer') newAnswer: IonInput;
  @ViewChild('isItGood') isItGood: IonToggle;
  @Input() location: Location;
  @Input() checkpoint: Checkpoint;
  @Input() locationType!: LocationType;
  @Input() isQuiz!: boolean;
  @Input() center!: Coordinates;
  checkpointForm: FormGroup;
  answers: { answer: string, correct: boolean }[] = [];
  LocationType = LocationType;

  constructor(private modalCtrl: ModalController,
              private formBuilder: FormBuilder,
              private imageService: ImageService) { }

  ngOnInit() {
    console.log(this.center)
    if (this.checkpoint) {
      let quiz: Quiz = {
        question: "",
        answers: [],
        help: ""
      };
      if (this.isQuiz && this.checkpoint.quiz) {
        quiz.question = this.checkpoint.quiz.question;
        quiz.answers = this.checkpoint.quiz.answers;
        this.answers = this.checkpoint.quiz.answers;
        quiz.help = this.checkpoint.quiz.help;
      }
      console.log("chckpoint", this.checkpoint);
      this.checkpointForm = this.formBuilder.group({
        name: new FormControl(this.checkpoint.name, { updateOn: "change", validators: [Validators.required]}),
        description: new FormControl(this.checkpoint.description, { updateOn: "change"}),
        imgUrl: new FormControl(this.checkpoint.imgUrl, { updateOn: "change"}),
        locationDescription: new FormControl(this.checkpoint.locationDescription, { updateOn: "change"}),
        locationAddress: new FormControl(this.checkpoint.locationAddress, { updateOn: "change"}),
        quiz: this.formBuilder.group({
          question: new FormControl(quiz.question, { updateOn: "change"}),
          answers: new FormControl(quiz.answers, { updateOn: "change"}),
          help: new FormControl(quiz.help, { updateOn: "change"}),
        }),
        info: new FormControl(this.checkpoint.info, { updateOn: "change"}),
      });
      console.log("locationAddress", this.checkpointForm.get('locationAddress').value)
    } else {
      this.checkpointForm = new FormGroup({
        name: new FormControl(null, { updateOn: "change", validators: [Validators.required]}),
        description: new FormControl(null, { updateOn: "change"}),
        imgUrl: new FormControl(null, { updateOn: "change"}),
        locationDescription: new FormControl(null, { updateOn: "change"}),
        locationAddress: new FormControl(null, { updateOn: "change"}),
        quiz: this.formBuilder.group({
          question: new FormControl(null, { updateOn: "change"}),
          answers: new FormControl(null, { updateOn: "change"}),
          help: new FormControl(null, { updateOn: "change"}),
        }),
        info: new FormControl(null, { updateOn: "change"}),
      });
    }
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  createCheckpoint() {
    console.log("checkpoint", this.checkpointForm);
    if (!this.checkpointForm.valid) {
      return;
    }
    let info = (!this.isQuiz && this.checkpointForm.value.info)
      ? this.checkpointForm.value.info : null;

    let quiz: Quiz = (this.isQuiz && this.checkpointForm.get('quiz').value) ? {
      question: this.checkpointForm.get('quiz').value.question,
      answers: this.checkpointForm.get('quiz').value.answers,
      help: (this.checkpointForm.get('quiz').value.help)
    } : null;

    this.checkpoint = new Checkpoint(
      null,
      this.checkpointForm.value.name,
      this.checkpointForm.value.description,
      this.checkpointForm.value.imgUrl,
      this.checkpointForm.value.locationDescription,
      this.checkpointForm.value.locationAddress,
      quiz,
      info
    );

    this.modalCtrl.dismiss(this.checkpoint);
  }

  onLocationPicked(location: Location) {
    this.checkpointForm.patchValue({ locationAddress: location })
  }

  addAnswer(newAnswer: string, isItGood: boolean) {
    console.log("new answer", newAnswer, isItGood);
    this.answers.push({ answer: newAnswer, correct: isItGood });
    this.checkpointForm.get('quiz').patchValue({ answers: this.answers });
    this.newAnswer.value = "";
    this.isItGood.checked = false;
    console.log("info", this.newAnswer, this.isItGood, this.answers)
  }

  changeAnswer(a: { answer: string, correct: boolean }, event) {
    this.answers.forEach(answer => {
      console.log("answer", answer, event);
      if (answer === a) {
        answer.answer = event.detail.value;
      }
    })
  }

  changeAnswerCorrection(a: { answer: string, correct: boolean }, event) {
    this.answers.forEach(answer => {
      console.log("answer", answer, event);
      if (answer === a) {
        answer.correct = event.detail.checked;
      }
    })
  }

  deleteAnswer(answer: { answer: string, correct: boolean }) {
    console.log("new answer", answer);

    this.answers = this.answers.filter(a => a !== answer);
    this.checkpointForm.get('quiz').patchValue({ answers: this.answers });
    this.newAnswer.value = "";
    this.isItGood.checked = false;
  }

  isNotValid() {
    let quizExist = (this.isQuiz)
      ? ((this.checkpointForm.get('quiz').value && this.checkpointForm.get('quiz').value.answers)
        ? (this.checkpointForm.get('quiz').value.question && this.checkpointForm.get('quiz').value.answers.length > 0)
        : false)
      : this.checkpointForm.value.info;
    let locationExist = (this.locationType === LocationType.location)
      ? this.checkpointForm.value.locationAddress
      : ((this.locationType === LocationType.description) ? this.checkpointForm.value.locationDescription : true);

    return !(this.checkpointForm.valid && quizExist && locationExist)
  }

  onImagePick(imageData: string | File) {
    console.log(imageData);
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = this.imageService.convertbase64toBlob(imageData);
      } catch (error) {
        console.log("error", error);
        return;
      }
    } else {
      imageFile = imageData
    }
    this.checkpointForm.patchValue({imgUrl: imageFile})
  }

}
