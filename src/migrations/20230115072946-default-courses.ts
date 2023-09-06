import { DefaultSubjects } from '@shared/enums';
import { ICourseCreate, ISubjectCreate } from '@shared/interfaces';
import * as csvToJson from 'csvtojson';
import * as mongo from 'mongodb';
import { join } from 'path';

const defaultSubject: ISubjectCreate = {
  name: DefaultSubjects.courses,
};

module.exports = {
  async up(db: mongo.Db) {
    const subjectsCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const coursesCollection = db.collection<ICourseCreate>(
      DefaultSubjects.courses,
    );

    const courses = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'courses.csv'),
    );

    await subjectsCollection.insertOne(defaultSubject);

    await coursesCollection.insertMany(courses);
  },

  async down(db: mongo.Db) {
    const subjectsCollection = db.collection<ISubjectCreate>(
      DefaultSubjects.subjects,
    );
    const coursesCollection = db.collection<ICourseCreate>(
      DefaultSubjects.courses,
    );

    const courses: ICourseCreate[] = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'courses.csv'),
    );

    await coursesCollection.deleteMany({
      name: {
        $in: courses.map((Course) => Course.name),
      },
    });
    await subjectsCollection.findOneAndDelete(defaultSubject);
  },
};
