import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUniversity } from '@shared/interfaces';
import { Document } from 'mongoose';

export type UniversityDocument = University & Document;

@Schema({ timestamps: true })
export class University implements IUniversity {
  _id: string;

  @Prop({ type: String })
  name;

  @Prop({ type: String })
  codigo_da_mantenedora;

  @Prop({ type: String })
  cnpj;

  @Prop({ type: String })
  nome_da_mantenedora;

  @Prop({ type: String })
  natureza_juridica_da_mantenedora;

  @Prop({ type: String })
  codigo_da_ies;

  @Prop({ type: String })
  sigla_da_ies;

  @Prop({ type: String })
  categoria_administrativa_da_ies;

  @Prop({ type: String })
  organizacao_academica_da_ies;

  @Prop({ type: String })
  sistema_de_ensino_da_ies;

  @Prop({ type: String })
  ies_comunitaria_sn;

  @Prop({ type: String })
  ies_confessional_sn;

  @Prop({ type: String })
  ies_filantropica_sn;

  @Prop({ type: String })
  logradouro;

  @Prop({ type: String })
  cep;

  @Prop({ type: String })
  codigo_do_municipio_ibge;

  @Prop({ type: String })
  municipio;

  @Prop({ type: String })
  uf;

  @Prop({ type: String })
  telefone;

  @Prop({ type: String })
  fax;

  @Prop({ type: String })
  e_mail;

  @Prop({ type: String })
  site;

  @Prop({ type: String })
  representante_legal;

  @Prop({ type: String })
  conceito_institucional_ci;

  @Prop({ type: String })
  ano_do_ci;

  @Prop({ type: String })
  indice_geral_de_cursos_igc;

  @Prop({ type: String })
  ano_do_igc;

  @Prop({ type: String })
  ato_de_credenciamento;

  @Prop({ type: String })
  data_do_ato_de_credenciamento;

  @Prop({ type: String })
  ato_de_recredenciamento;

  @Prop({ type: String })
  data_do_ato_de_recredenciamento;
}

export const UniversitySchema = SchemaFactory.createForClass(University);
