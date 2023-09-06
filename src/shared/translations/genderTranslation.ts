import { Gender } from '@shared/enums';

const genderTranslation = {
  [Gender.MALE]: 'Masculino',
  [Gender.FEMALE]: 'Feminino',
  [Gender.TRANSGENDER]: 'Transgênero',
  [Gender.GENDERNEUTRAL]: 'Gênero neutro',
  [Gender.NONBINARY]: 'Não-binário',
  [Gender.NOTINFORM]: 'Prefiro não informar',
  [Gender.OTHERS]: 'Outros',
};

export { genderTranslation };
