import {Checkpoint} from "./checkpoint.model";

export class Game {
  public id: string;
  public name: string;
  public creatorName: string;
  public hasALocation: boolean;
  public country: string;
  public pointOfDeparture: string;
  public category: string;
  public quiz: boolean;
  public description: string;
  public imgUrl: string;
  public numberOfAttempts: number;
  public distance: number;
  public duration: number;
  public creationDate: Date;
  public itIsPublic: boolean;
  public checkpoints: Checkpoint[];
  public ratings: string[];
  public userId: string;

  constructor(
    id: string,
    name: string,
    creatorName: string,
    hasALocation: boolean,
    country: string,
    pointOfDeparture: string,
    category: string,
    quiz: boolean,
    description: string,
    imgUrl: string,
    distance: number,
    duration: number,
    itIsPublic: boolean,
    userId: string
  ) {
    this.id = id;
    this.name = name;
    this.creatorName = creatorName;
    this.hasALocation = hasALocation;
    this.country = country;
    this.pointOfDeparture = pointOfDeparture;
    this.category = category;
    this.quiz = quiz;
    this.numberOfAttempts = 0;
    this.description = description;
    this.imgUrl = imgUrl;
    this.distance = distance;
    this.duration = duration;
    this.creationDate = new Date();
    this.checkpoints = [];
    this.ratings = [];
    this.itIsPublic = itIsPublic;
    this.userId = userId;

  }

}


