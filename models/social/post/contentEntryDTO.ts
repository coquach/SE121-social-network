import { MediaDTO, TargetType } from "../enums/social.enum";

export interface ContentEntryDTO {
  id: string;
  type: TargetType;
  content: string;
  medias?: MediaDTO[];
  reportPendingCount: number;
  createdAt: Date;
}