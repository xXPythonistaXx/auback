import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Job, JobDocument } from '../job/job.schema';

export type MacroJobDocument = MacroJob & Document;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class MacroJob {
  _id: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop()
  endAt?: Date;

  @Prop()
  closedAt?: string;

  @Prop({ required: true, trim: true })
  slug?: string;

  @Prop([{ type: SchemaTypes.ObjectId, ref: Job.name }])
  jobs?: JobDocument[];

  @Prop()
  get hasJobs(): boolean {
    return this.jobs && this.jobs.length > 0;
  }

  @Prop({ trim: true })
  iconUrl?: string;

  @Prop({ trim: true })
  backgroundUrl?: string;

  @Prop({ trim: true })
  responsable?: string;
}

const MacroJobSchema = SchemaFactory.createForClass(MacroJob);

export { MacroJobSchema };
