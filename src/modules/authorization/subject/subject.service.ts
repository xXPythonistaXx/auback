import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Subject, SubjectDocument } from '@schemas';
import { ErrorCodes } from '@shared/enums';
import { ISubjectCreate, ISubjectPayload } from '@shared/interfaces';
import { Model } from 'mongoose';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  async findSubjectById(id: string): Promise<ISubjectPayload> {
    return this.subjectModel.findById(id).populate('permissions').lean();
  }

  async createSubject(subject: ISubjectCreate) {
    const subjectExists = await this.subjectModel.exists({
      name: subject.name,
    });
    if (subjectExists)
      throw new BadRequestException({
        errorCode: ErrorCodes.DATA_ALREADY_EXISTS,
        message: 'Subject já cadastrada!',
      });

    const newSubject = await this.createAllSubjects([subject]);
    return newSubject;
  }

  async createSubjects(subjects: ISubjectCreate[]) {
    const subjectsExists: string[] = [];
    const newSubjects: ISubjectCreate[] = [];
    await Promise.all(
      subjects.map(async (subject) => {
        const subjectExist = await this.subjectModel.exists({
          name: subject.name,
        });
        if (subjectExist) {
          subjectsExists.push(subject.name);
        } else {
          newSubjects.push(subject);
        }
      }),
    );
    if (newSubjects) {
      const createdSubjects = await this.createAllSubjects(newSubjects);
      return createdSubjects.save();
    }
    if (subjectsExists.length > 0)
      throw new BadRequestException({
        errorCode: ErrorCodes.DATA_ALREADY_EXISTS,
        message: `Entity ${subjectsExists[0]} já cadastrada!`,
      });
  }

  private async createAllSubjects(roles: ISubjectCreate[]) {
    const newEntities = new this.subjectModel(roles);
    return newEntities.save();
  }
}
