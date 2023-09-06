export interface IUniversity {
  name: string;
  codigo_da_mantenedora: string;
  cnpj: string;
  nome_da_mantenedora: string;
  natureza_juridica_da_mantenedora: string;
  codigo_da_ies: string;
  sigla_da_ies: string;
  categoria_administrativa_da_ies: string;
  organizacao_academica_da_ies: string;
  sistema_de_ensino_da_ies: string;
  ies_comunitaria_sn: string;
  ies_confessional_sn: string;
  ies_filantropica_sn: string;
  logradouro: string;
  cep: string;
  codigo_do_municipio_ibge: string;
  municipio: string;
  uf: string;
  telefone: string;
  fax: string;
  e_mail: string;
  site: string;
  representante_legal: string;
  conceito_institucional_ci: string;
  ano_do_ci: string;
  indice_geral_de_cursos_igc: string;
  ano_do_igc: string;
  ato_de_credenciamento: string;
  data_do_ato_de_credenciamento: string;
  ato_de_recredenciamento: string;
  data_do_ato_de_recredenciamento: string;
}

export interface IUniversityPayload extends IUniversity {
  _id: string;
}

export type IUniversityUpdate = Partial<IUniversity>;
export type IUniversityCreate = IUniversity;
