import {ChatType} from '../enums/ChatType';

export interface Chat {
  userEmail: string;
  partnerName: string;
  type: ChatType;
}
