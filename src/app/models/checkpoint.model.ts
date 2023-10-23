export class Checkpoint {
  public id: string;
  public name: string;
  public description: string;
  public imgUrl: string;



  public locationType: string;
  public locationDescription: string;
  public locationAddress: string;


  public type: string; //question/info
  public quiz: boolean;


  constructor(
    id: string,
    name: string,
    creatorName: string,
    country: string,
    pointOfDeparture: string,
    category: string,
    quiz: boolean,
    description: string,
    imgUrl: string,
  ) {
    this.id = id;
    this.name = name;
    this.quiz = quiz;
    this.description = description;
    this.imgUrl = imgUrl;

  }

}



