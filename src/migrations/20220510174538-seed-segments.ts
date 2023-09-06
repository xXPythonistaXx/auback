import { DefaultSubjects } from '@shared/enums';
import { ISegmentCreate } from '@shared/interfaces';
import * as csvToJson from 'csvtojson';
import * as mongo from 'mongodb';
import { join } from 'path';

module.exports = {
  async up(db: mongo.Db) {
    const segmentCollection = db.collection<ISegmentCreate>(
      DefaultSubjects.segments,
    );

    const segments: ISegmentCreate[] = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'segments.csv'),
    );
    await segmentCollection.insertMany(segments);
  },

  async down(db: mongo.Db) {
    const segmentCollection = db.collection<ISegmentCreate>(
      DefaultSubjects.segments,
    );

    const segments: ISegmentCreate[] = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'segments.csv'),
    );
    await segmentCollection.deleteMany({
      name: {
        $in: segments.map((segment) => segment.name),
      },
    });
  },
};
