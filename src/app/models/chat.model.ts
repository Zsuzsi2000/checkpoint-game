import {ChatType} from "../enums/ChatType";
import {Message} from "../interfaces/Message";

export class Chat {
  constructor(
    public id: string,
    public name: string,
    public eventId: string,
    public participants: string[],
    public message: Message[] = [],
    public type: ChatType,
  ) {}
}
