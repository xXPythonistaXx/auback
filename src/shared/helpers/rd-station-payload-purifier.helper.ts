/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { HumanRace } from '@shared/enums';

export function rdStationPayloadPurifier(payload: any) {
  const linkedinUsername = payload?.linkedinUrl?.split('/').pop() || null;
  const length = payload?.academicBackgrounds?.length || 0;

  let ethnicity: string;
  switch (payload?.humanRace) {
    case HumanRace.WHITE:
      ethnicity = 'Branca';
      break;
    case HumanRace.BLACK:
      ethnicity = 'Preta';
      break;
    case HumanRace.BROWN:
      ethnicity = 'Parda';
      break;
    case HumanRace.ASIATIC:
      ethnicity = 'Amarela';
      break;
    case HumanRace.INDIGENOUS:
      ethnicity = 'Indígena';
      break;
    default:
      ethnicity = 'Prefiro não informar';
      break;
  }

  const tags = ['app.academiadouniversitario'];

  if (process.env.NODE_ENV !== 'production') {
    tags.push('lead.development');
  }

  return {
    email: payload.user.email,
    name: payload.fullName,
    tags,
    personal_phone: payload?.phoneNumber || '',
    website: payload?.portfolioUrl || '',
    mobile_phone: payload?.phoneNumber || '',
    city: payload?.city || '',
    linkedin: linkedinUsername,
    job_title: 'Estagiário',
    bio: payload?.about?.resume || '',
    state: payload?.state || '',
    country: 'brasil',
    cf_perdidos_da_meetime: '',
    cf_seu_nome: `${payload?.firstName}  ${payload?.lastName}`,
    cf_faculdade: length
      ? payload?.academicBackgrounds[length - 1]?.university?.name
      : '',
    cf_cor_raca_etnia_4: ethnicity,
  };
}
