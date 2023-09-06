export interface ICertificate {
  name: string;
  date?: string;
}

export interface ICertificateUpdate extends Partial<ICertificate> {
  _id: string;
}

export type ICertificateCreate = Partial<ICertificate>;

export type ICertificatePayload = ICertificate;
