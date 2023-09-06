import { DefaultSubjects } from '@shared/enums';
import { IToolCreate } from '@shared/interfaces';
import * as csvToJson from 'csvtojson';
import * as mongo from 'mongodb';
import { join } from 'path';

module.exports = {
  async up(db: mongo.Db) {
    const toolCollection = db.collection<IToolCreate>(DefaultSubjects.tools);

    const tools: IToolCreate[] = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'tools.csv'),
    );
    await toolCollection.insertMany(tools);
  },

  async down(db: mongo.Db) {
    const toolCollection = db.collection<IToolCreate>(DefaultSubjects.tools);

    const tools: IToolCreate[] = await csvToJson().fromFile(
      join(__dirname, '..', '..', 'data', 'tools.csv'),
    );
    await toolCollection.deleteMany({
      name: {
        $in: tools.map((tool) => tool.name),
      },
    });
  },
};
