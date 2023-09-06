export interface IState {
  cod: number;
  name: string;
  abbreviated: string;
}

export interface IStatePayload extends IState {
  _id: string;
}

export type IStateUpdate = Partial<IState>;
export type IStateCreate = IState;
