export interface IPsTestResult {
  status?: string;
  userId: number;
  userTestId?: number;
  startedAt?: string;
  finishedAt?: string;
  retries?: number;
  results?: Array<{
    competenceId: number;
    name: string;
    score: number;
  }>;
  psTestUrl?: string;
}

export type IPsTestResultUpdate = Partial<IPsTestResult>;
export type IPsTestResultCreate = IPsTestResult;
