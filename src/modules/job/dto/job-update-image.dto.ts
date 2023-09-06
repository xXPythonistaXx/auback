import { IImage } from '@shared/interfaces';
import { Transform } from 'class-transformer';

export class UpdateJobImageDTO {
  @Transform(({ value }) => {
    return Buffer.from(value as string, 'base64');
  })
  jobImage: IImage;
}
