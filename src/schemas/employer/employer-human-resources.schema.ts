import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IEmployerHumanResources } from '@shared/interfaces';
import { Document } from 'mongoose';

export type EmployerHumanResourcesDocument = EmployerHumanResources & Document;

@Schema()
export class EmployerHumanResources implements IEmployerHumanResources {
  _id: string;

  @Prop({ trim: true })
  legalRepresentant?: string;

  @Prop({ trim: true })
  legalRepresentantEmail?: string;

  @Prop({ trim: true })
  legalRepresentantJobTitle?: string;

  @Prop({ trim: true })
  internshipResponsible?: string;

  @Prop({ trim: true })
  internshipResponsibleEmail?: string;

  @Prop({ trim: true })
  contractResponsible?: string;

  @Prop({ trim: true })
  contractResponsibleEmail?: string;

  @Prop()
  isSameInternshipSponsorValue?: boolean;

  @Prop()
  willProvideEquipamentForIntern?: boolean;
}

export const EmployerHumanResourcesSchema = SchemaFactory.createForClass(
  EmployerHumanResources,
);
