import { rdStationPayloadPurifier } from './rd-station-payload-purifier.helper';

describe('rdStationPayloadPurifier', () => {
  it('should return a purifier payload', () => {
    const payload = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john.due@mail.com',
      },
      fullName: 'John Doe',
      phoneNumber: '11999999999',
      portfolioUrl: 'https://www.portfolio.com',
      city: 'São Paulo',
      linkedinUrl: 'https://www.linkedin.com/in/john-doe',
      about: {
        resume: 'I am a developer',
      },
      state: 'SP',
      firstName: 'John',
      lastName: 'Doe',
      academicBackgrounds: [
        {
          university: {
            name: 'University of São Paulo',
          },
        },
      ],
      humanRace: 'BLACK',
    };

    const purifierPayload = rdStationPayloadPurifier(payload);

    expect(purifierPayload).toEqual({
      email: payload.user.email,
      name: payload.fullName,
      tags: ['app.academiadouniversitario', 'lead.development'],
      personal_phone: payload.phoneNumber,
      website: payload.portfolioUrl,
      mobile_phone: payload.phoneNumber,
      city: payload.city,
      linkedin: 'john-doe',
      job_title: 'Estagiário',
      bio: payload.about.resume,
      state: payload.state,
      country: 'brasil',
      cf_perdidos_da_meetime: '',
      cf_seu_nome: `${payload.firstName}  ${payload.lastName}`,
      cf_faculdade: payload.academicBackgrounds[0].university.name,
      cf_cor_raca_etnia_4: 'Preta',
    });
  });
});
