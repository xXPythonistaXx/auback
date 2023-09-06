export const DefaultJobStepsMock = [
  {
    name: 'Trilha de Aprendizagem',
    order: 1,
    approvedMessage:
      'Parabéns pela aprovação nesta etapa da seleção de estágio em <%= employerName %>!\n\nEstamos muito felizes em informar que você foi aprovado e continuamos interessados em sua candidatura. Em breve entraremos em contato para informá-lo sobre as próximas etapas do processo seletivo.\n\nAgradecemos pela sua participação e desejamos boa sorte para as próximas fases!\n\nAtenciosamente,\n<%= employerName %>',
    reprovedMessage:
      'Prezado(a) <%= employeeName %>,\n\nAgradecemos pela sua participação em nosso processo seletivo para estágio em <%= employerName %>. Infelizmente, informamos que você não foi aprovado nesta etapa do processo.\n\nAgradecemos pelo seu interesse em nossa empresa e desejamos sucesso em suas próximas empreitadas profissionais. Fique à vontade para se candidatar novamente em futuras oportunidades.\n\nAtenciosamente,\n<%= employerName %>',
    lastStep: false,
    closed: false,
    candidates: [],
    defaultStep: true,
  },
  {
    name: 'Seleção AU',
    order: 2,
    approvedMessage:
      'Parabéns pela aprovação nesta etapa da seleção de estágio em <%= employerName %>!\n\nEstamos muito felizes em informar que você foi aprovado e continuamos interessados em sua candidatura. Em breve entraremos em contato para informá-lo sobre as próximas etapas do processo seletivo.\n\nAgradecemos pela sua participação e desejamos boa sorte para as próximas fases!\n\nAtenciosamente,\n<%= employerName %>',
    reprovedMessage:
      'Prezado(a) <%= employeeName %>,\n\nAgradecemos pela sua participação em nosso processo seletivo para estágio em <%= employerName %>. Infelizmente, informamos que você não foi aprovado nesta etapa do processo.\n\nAgradecemos pelo seu interesse em nossa empresa e desejamos sucesso em suas próximas empreitadas profissionais. Fique à vontade para se candidatar novamente em futuras oportunidades.\n\nAtenciosamente,\n<%= employerName %>',
    lastStep: false,
    closed: false,
    candidates: [],
    defaultStep: true,
  },
  {
    name: 'Seleção Empresa',
    order: 3,
    approvedMessage:
      'Parabéns pela aprovação nesta etapa da seleção de estágio em <%= employerName %>!\n\nEstamos muito felizes em informar que você foi aprovado e continuamos interessados em sua candidatura. Em breve entraremos em contato para informá-lo sobre as próximas etapas do processo seletivo.\n\nAgradecemos pela sua participação e desejamos boa sorte para as próximas fases!\n\nAtenciosamente,\n<%= employerName %>',
    reprovedMessage:
      'Prezado(a) <%= employeeName %>,\n\nAgradecemos pela sua participação em nosso processo seletivo para estágio em <%= employerName %>. Infelizmente, informamos que você não foi aprovado nesta etapa do processo.\n\nAgradecemos pelo seu interesse em nossa empresa e desejamos sucesso em suas próximas empreitadas profissionais. Fique à vontade para se candidatar novamente em futuras oportunidades.\n\nAtenciosamente,\n<%= employerName %>',
    lastStep: true,
    closed: false,
    candidates: [],
    defaultStep: true,
  },
];
