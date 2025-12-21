import { MediaItem } from "@/lib/types/media";
import { TargetType } from "../enums/social.enum";

export interface ContentEntryDTO {
  id: string;
  type: TargetType;
  content: string;
  medias?: MediaItem[];
  reportCount: number;
  createdAt: Date;
}