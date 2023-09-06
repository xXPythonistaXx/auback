import { Pcd } from '@shared/enums';

const pcdTranslation = {
  [Pcd.NOT_PCD]: 'Não sou PCD',
  [Pcd.HEARING_IMPAIRED]: 'Deficiência auditiva',
  [Pcd.MENTALLY_IMPAIRED]: 'Deficiência mental',
  [Pcd.PHYSICAL_IMPAIRED]: 'Deficiência física',
  [Pcd.VISUALLY_IMPAIRED]: 'Deficiência visual',
  [Pcd.MOTOR_DISABILITY]: 'Deficiência motora',
  [Pcd.RATHER_NOT_SAY]: 'Prefiro não dizer',
};

export { pcdTranslation };
