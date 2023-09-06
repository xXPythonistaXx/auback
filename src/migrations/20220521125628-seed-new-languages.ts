import { DefaultSubjects } from '@shared/enums';
import { ILanguageCreate } from '@shared/interfaces';
import * as mongo from 'mongodb';

const defaultLanguages: ILanguageCreate[] = [
  {
    name: 'Libras',
  },
];

module.exports = {
  async up(db: mongo.Db) {
    const languageCollection = db.collection<ILanguageCreate>(
      DefaultSubjects.languages,
    );

    await languageCollection.insertMany(defaultLanguages);
  },

  async down(db: mongo.Db) {
    const languageCollection = db.collection<ILanguageCreate>(
      DefaultSubjects.languages,
    );

    const operations = defaultLanguages.map((entity) => {
      return languageCollection.deleteOne({ name: entity.name });
    });
    await Promise.all(operations);
  },
};
