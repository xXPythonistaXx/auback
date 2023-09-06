import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  FamilyIncome,
  HumanRace,
  InternshipModel,
  LivingPlace,
  Pcd,
  SexualOrientation,
  Studentship,
  WhereStudiedHighSchool,
} from '@shared/enums';
import { IAboutEmployee } from '@shared/interfaces';
import { Document } from 'mongoose';

export type AboutEmployeeDocument = AboutEmployee & Document;

@Schema()
export class AboutEmployee implements IAboutEmployee {
  @Prop()
  resume?: string;

  @Prop()
  videoUrl?: string;

  @Prop()
  internshipModel: InternshipModel[];

  @Prop()
  humanRace?: HumanRace;

  @Prop()
  sexualOrientation?: SexualOrientation;

  @Prop()
  pcd?: Pcd;

  @Prop()
  livingPlace?: LivingPlace;

  @Prop()
  whereStudiedHighSchool?: WhereStudiedHighSchool;

  @Prop()
  familyIncome?: FamilyIncome;

  @Prop()
  studentship?: Studentship;
}

export const AboutEmployeeSchema = SchemaFactory.createForClass(AboutEmployee);
