import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PsTestResultDocument = PsTestResult & Document;
@Schema({ collection: 'push_start_candidate_results' })
export class PsTestResult {
  @Prop({ required: false })
  status?: string;

  @Prop({ required: true })
  userId: number;

  @Prop({ required: false })
  userTestId?: number;

  @Prop({ required: false })
  startedAt?: string;

  @Prop({ required: false })
  finishedAt?: string;

  @Prop({ required: false })
  retries?: number;

  @Prop([
    {
      competenceId: { type: Number, required: false },
      name: { type: String, required: false },
      score: { type: Number, required: false },
    },
  ])
  results?: Array<{
    competenceId: number;
    name: string;
    score: number;
  }>;

  @Prop()
  psTestUrl?: string;
}

export const PsTestResultSchema = SchemaFactory.createForClass(PsTestResult);
