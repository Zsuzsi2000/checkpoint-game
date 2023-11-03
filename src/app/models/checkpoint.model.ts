import {Location} from "../interfaces/Location";
import {Quiz} from "../interfaces/Quiz";

export class Checkpoint {

  constructor(
    public index: number,
    public name: string,
    public description: string,
    public imgUrl: string,
    public locationDescription: string,
    public locationAddress: Location,
    public quiz: Quiz,
    public info: string
  ) {}

}



