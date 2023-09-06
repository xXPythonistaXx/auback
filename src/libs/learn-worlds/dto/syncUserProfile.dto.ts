import { IsNotEmpty } from 'class-validator';
import { User } from './user.dto';

export class SyncUserProfileDTO {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  issued: number;

  @IsNotEmpty()
  attempts: number;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  score: string;

  @IsNotEmpty()
  short_url: string;

  @IsNotEmpty()
  user: User;

  @IsNotEmpty()
  course_id: string;
}
