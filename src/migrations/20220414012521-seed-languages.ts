import { DefaultSubjects } from '@shared/enums';
import { ILanguageCreate } from '@shared/interfaces';
import * as mongo from 'mongodb';

const defaultLanguages: ILanguageCreate[] = [
  {
    name: 'Inglês',
  },
  {
    name: 'Espanhol',
  },
  {
    name: 'Francês',
  },
  {
    name: 'Italiano',
  },
  {
    name: 'Mandarim',
  },
  {
    name: 'Alemão',
  },
  {
    name: 'Russo',
  },
  {
    name: 'Hindi',
  },
  {
    name: 'Coreano',
  },
  {
    name: 'Japonês',
  },
  {
    name: 'Árabe',
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
