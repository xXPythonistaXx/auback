import { Transform } from 'class-transformer';
import { IImage } from '../../../shared/interfaces';

export class EmployeeUpdateImage {
  @Transform(({ value }) => {
    return Buffer.from(value as string, 'base64');
  })
  image: IImage;
}
