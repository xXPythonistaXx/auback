import { DefaultSubjects } from '@shared/enums';
import { IUniversityCreate, ISubjectCreate } from '@shared/interfaces';
import * as csvToJson from 'csvtojson';
import * as mongo from 'mongodb';
import { join } from 'path';

const defaultSubject: ISubjectCreate = {
  name: DefaultSubjects.universities,
};

module.exports = {
  async up(db: mongo.Db) {
    const subjectsCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const universitiesCollection = db.collection<IUniversityCreate>(
      DefaultSubjects.universities,
    );

    const universities = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'universities.csv'),
    );

    await subjectsCollection.insertOne(defaultSubject);

    await universitiesCollection.insertMany(universities);
  },

  async down(db: mongo.Db) {
    const subjectsCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const universitiesCollection = db.collection<IUniversityCreate>(
      DefaultSubjects.universities,
    );

    const universities: IUniversityCreate[] = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'universities.csv'),
    );

    await universitiesCollection.deleteMany({
      name: {
        $in: universities.map((university) => university.name),
      },
    });
    await subjectsCollection.findOneAndDelete(defaultSubject);
  },
};
