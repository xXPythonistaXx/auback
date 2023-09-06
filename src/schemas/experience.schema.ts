import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IExperience } from '@shared/interfaces';
import { Document } from 'mongoose';

export type ExperienceDocument = Experience & Document;

@Schema()
export class Experience implements IExperience {
  @Prop({ trim: true })
  employer: string;

  @Prop({ trim: true })
  jobTitle: string;

  @Prop()
  startedAt: string;

  @Prop()
  finishedAt?: string;

  @Prop()
  activities: string;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);
