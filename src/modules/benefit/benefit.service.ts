import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Benefit, BenefitDocument } from '@schemas';
import { IBenefitCreate } from '@shared/interfaces';
import { Model } from 'mongoose';

@Injectable()
export class BenefitService {
  constructor(
    @InjectModel(Benefit.name)
    private benefitModel: Model<BenefitDocument>,
  ) {}

  findAll() {
    return this.benefitModel.find().lean();
  }

  async createBenefit(benefits: IBenefitCreate[]) {
    return this.benefitModel.insertMany(benefits);
  }
}
