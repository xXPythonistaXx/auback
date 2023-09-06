import { DefaultSubjects } from '@shared/enums';
import { IStateCreate, ISubjectCreate } from '@shared/interfaces';
import * as csvToJson from 'csvtojson';
import * as mongo from 'mongodb';
import { join } from 'path';

const defaultSubject: ISubjectCreate = {
  name: DefaultSubjects.states,
};

module.exports = {
  async up(db: mongo.Db) {
    const subjectsCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const statesCollection = db.collection<IStateCreate>(
      DefaultSubjects.states,
    );

    const states = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'brazilian-states.csv'),
    );

    await subjectsCollection.insertOne(defaultSubject);

    await statesCollection.insertMany(states);
  },

  async down(db: mongo.Db) {
    const subjectsCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const statesCollection = db.collection<IStateCreate>(
      DefaultSubjects.states,
    );

    const states: IStateCreate[] = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'brazilian-states.csv'),
    );

    await statesCollection.deleteMany({
      name: {
        $in: states.map((state) => state.name),
      },
    });
    await subjectsCollection.findOneAndDelete(defaultSubject);
  },
};
