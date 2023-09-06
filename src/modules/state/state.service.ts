import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { State, StateDocument } from '@schemas';
import { Model } from 'mongoose';

@Injectable()
export class StateService {
  constructor(
    @InjectModel(State.name) private stateModel: Model<StateDocument>,
  ) {}

  findAll() {
    return this.stateModel.find().sort({ abbreviated: 1 }).exec();
  }
}
