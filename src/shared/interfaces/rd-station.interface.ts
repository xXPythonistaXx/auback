export interface ContactPayload {
  tags: string[];
  personal_phone: string;
  website: string;
  mobile_phone: string;
  city: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  email: string;
  name: string;
  job_title: string;
  bio: string;
  state: string;
  country: string;
  cf_perdidos_da_meetime: string;
  cf_seu_nome: string;
  cf_faculdade: string;
  cf_cor_raca_etnia_4: string;
}

export interface AccessData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
