export interface ITool {
  name: string;
}

export interface IToolUpdate extends Partial<ITool> {
  _id: string;
}

export type IToolCreate = Partial<ITool>;

export interface IToolPayload extends ITool {
  _id: string;
}
