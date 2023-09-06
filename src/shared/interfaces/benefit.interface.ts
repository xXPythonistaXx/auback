export interface IBenefit {
  name: string;
}

export type IBenefitCreate = IBenefit;
export type IBenefitUpdate = Partial<IBenefit>;

export interface IBenefitPayload extends IBenefit {
  _id: string;
}
