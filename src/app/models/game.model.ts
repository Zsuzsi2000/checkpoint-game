import {Checkpoint} from "./checkpoint.model";
import {Location} from "../interfaces/Location";
import {LocationType} from "../enums/LocationType";
import {LocationIdentification} from "../enums/LocationIdentification";

export class Game {
  public id: string;
  public name: string;
  public creatorName: string;
  public locationType: LocationType;
  public locationIdentification: LocationIdentification;
  public country: string;
  public pointOfDeparture: Location;
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
  public ratings: { username: string, text: string }[];
  public bests: { score: number, duration: number, checkpointDuration: number };
  public userId: string;
  public mapUrl: string;

  constructor(
    id: string,
    name: string,
    creatorName: string,
    locationType: LocationType,
    locationIdentification: LocationIdentification,
    country: string,
    pointOfDeparture: Location,
    category: string,
    quiz: boolean,
    description: string,
    imgUrl: string,
    distance: number,
    duration: number,
    itIsPublic: boolean,
    userId: string,
    mapUrl: string,
    checkpoints: Checkpoint[],
    numberOfAttempts: number = 0,
    creationDate: Date = new Date(),
    ratings: { username: string, text: string }[] = [],
    bests: { score: number, duration: number, checkpointDuration: number } = null
  ) {
    this.id = id;
    this.name = name;
    this.creatorName = creatorName;
    this.locationType = locationType;
    this.locationIdentification = locationIdentification;
    this.country = country;
    this.pointOfDeparture = pointOfDeparture;
    this.category = category;
    this.quiz = quiz;
    this.numberOfAttempts = numberOfAttempts;
    this.description = description;
    this.imgUrl = imgUrl;
    this.distance = distance;
    this.duration = duration;
    this.creationDate = creationDate;
    this.checkpoints = checkpoints;
    this.ratings = ratings;
    this.itIsPublic = itIsPublic;
    this.userId = userId;
    this.mapUrl = mapUrl;
    this.bests = bests;
  }

}


