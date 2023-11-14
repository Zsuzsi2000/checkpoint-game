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
  @Input() locationType!: LocationType;
  @Input() isQuiz!: boolean;
  @Input() center!: Coordinates;
  @Input() checkpoint: Checkpoint;
  @Input() imageFile: File | Blob;

  checkpointForm: FormGroup;
  answers: { answer: string, correct: boolean }[] = [];
  LocationType = LocationType;
  qrString = '';

  constructor(private modalCtrl: ModalController,
              private formBuilder: FormBuilder,
              private imageService: ImageService) { }

  ngOnInit() {
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
      this.checkpointForm = this.formBuilder.group({
        name: new FormControl(this.checkpoint.name, { updateOn: "change", validators: [Validators.required]}),
        description: new FormControl(this.checkpoint.description, { updateOn: "change"}),
        imgUrl: new FormControl((this.checkpoint.imgUrl) ? this.checkpoint.imgUrl : this.imageFile, { updateOn: "change"}),
        locationDescription: new FormControl(this.checkpoint.locationDescription, { updateOn: "change"}),
        locationAddress: new FormControl(this.checkpoint.locationAddress, { updateOn: "change"}),
        quiz: this.formBuilder.group({
          question: new FormControl(quiz.question, { updateOn: "change"}),
          answers: new FormControl(quiz.answers, { updateOn: "change"}),
          help: new FormControl(quiz.help, { updateOn: "change"}),
        }),
        info: new FormControl(this.checkpoint.info, { updateOn: "change"}),
      });
    } else {
      if (this.locationType === LocationType.description) {

      }
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

    let locationAccessCode = (this.locationType === LocationType.description) ? "id" + Math.random().toString(16).slice(2) : null;

    let checkpoint1 = new Checkpoint(
      (this.checkpoint) ? this.checkpoint.index : null,
      this.checkpointForm.value.name,
      this.checkpointForm.value.description,
      (this.checkpoint && this.checkpoint.imgUrl) ? this.checkpoint.imgUrl : null,
      this.checkpointForm.value.locationDescription,
      this.checkpointForm.value.locationAddress,
      locationAccessCode,
      null,
      quiz,
      info
    );
    console.log(checkpoint1);

    this.modalCtrl.dismiss({ checkpoint: checkpoint1, imageFile: this.checkpointForm.value.imgUrl});
  }

  onLocationPicked(location: Location) {
    this.checkpointForm.patchValue({ locationAddress: location })
  }

  addAnswer(newAnswer: string, isItGood: boolean) {
    this.answers.push({ answer: newAnswer, correct: isItGood });
    this.checkpointForm.get('quiz').patchValue({ answers: this.answers });
    this.newAnswer.value = "";
    this.isItGood.checked = false;
  }

  changeAnswer(a: { answer: string, correct: boolean }, event) {
    this.answers.forEach(answer => {
      if (answer === a) {
        answer.answer = event.detail.value;
      }
    });
    this.checkpointForm.get('quiz').patchValue({ answers: this.answers });
  }

  changeAnswerCorrection(a: { answer: string, correct: boolean }, event) {
    this.answers.forEach(answer => {
      if (answer === a) {
        answer.correct = event.detail.checked;
      }
    });
    this.checkpointForm.get('quiz').patchValue({ answers: this.answers });
  }

  deleteAnswer(answer: { answer: string, correct: boolean }) {
    this.answers = this.answers.filter(a => a !== answer);
    this.checkpointForm.get('quiz').patchValue({ answers: this.answers });
    this.newAnswer.value = "";
    this.isItGood.checked = false;
  }

  quizIsReady() {
    let correctExist = false;
    if (this.checkpointForm.get('quiz').value && this.checkpointForm.get('quiz').value.answers
      && this.checkpointForm.get('quiz').value.question && this.checkpointForm.get('quiz').value.answers.length > 0) {
      this.checkpointForm.get('quiz').value.answers.forEach(answer => {
        if (answer.correct) { correctExist = true; }
      });
    }
    return correctExist;
  }

  isNotValid() {
    let quizExist = (this.isQuiz)
      ? this.quizIsReady()
      : this.checkpointForm.value.info;
    let locationExist = (this.locationType === LocationType.location)
      ? this.checkpointForm.value.locationAddress
      : ((this.locationType === LocationType.description) ? this.checkpointForm.value.locationDescription : true);

    return !(this.checkpointForm.valid && quizExist && locationExist)
  }

  onImagePick(imageData: string | File) {
    this.checkpointForm.patchValue({imgUrl: imageData})
  }

}
