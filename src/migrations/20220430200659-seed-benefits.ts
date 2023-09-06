import { DefaultSubjects } from '@shared/enums';
import { IBenefitCreate } from '@shared/interfaces';
import * as mongo from 'mongodb';

const defaultBenefits: IBenefitCreate[] = [
  {
    name: 'Vale Refeição',
  },
  {
    name: 'Vale Alimentação',
  },
  {
    name: 'Plano de Saúde',
  },
  {
    name: 'Plano Odontológico',
  },
  {
    name: 'Gympass',
  },
  {
    name: 'Plano de saúde Pet',
  },
  {
    name: 'Cursos pagos pela empresa',
  },
  {
    name: 'Bônus por metas',
  },
];

module.exports = {
  async up(db: mongo.Db) {
    const benefitsCollection = db.collection<IBenefitCreate>(
      DefaultSubjects.benefits,
    );

    await benefitsCollection.insertMany(defaultBenefits);
  },

  async down(db: mongo.Db) {
    const benefitsCollection = db.collection<IBenefitCreate>(
      DefaultSubjects.benefits,
    );

    const operations = defaultBenefits.map((entity) => {
      return benefitsCollection.deleteOne({ name: entity.name });
    });
    await Promise.all(operations);
  },
};
