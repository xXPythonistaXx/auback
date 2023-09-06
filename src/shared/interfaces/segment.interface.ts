export interface ISegment {
  name: string;
}

export type ISegmentCreate = ISegment;
export type ISegmentUpdate = Partial<ISegment>;

export interface ISegmentPayload extends ISegment {
  _id: string;
}
