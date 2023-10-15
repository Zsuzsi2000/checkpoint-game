export class Game {
  public id: string;
  public name: string;
  public creatorName: string;
  public country: string;
  public pointOfDeparture;
  public category: string;
  public quiz: boolean;
  public description: string;
  public imgUrl: string;
  public numberOfAttempts: number;
  public distance: number;
  public duration: number;
  public checkpoints: string[];
  public ratings: string[];

  constructor(
    id: string,
    name: string,
    creatorName: string,
    country: string,
    pointOfDeparture,
    category: string,
    quiz: boolean,
    description: string,
    imgUrl: string,
    distance: number,
    duration: number
  ) {
    this.id = id;
    this.name = name;
    this.creatorName = creatorName;
    this.country = country;
    this.pointOfDeparture = pointOfDeparture;
    this.category = category;
    this.quiz = quiz;
    this.numberOfAttempts = 0;
    this.description = description;
    this.imgUrl = imgUrl;
    this.distance = distance;
    this.duration = duration;
    this.checkpoints = [];
    this.ratings = [];

  }

}
