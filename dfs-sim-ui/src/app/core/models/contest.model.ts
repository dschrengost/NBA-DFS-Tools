export interface PayoutBucket {
  from: number;
  to: number;
  amount: number;
}

export interface ContestStructure {
  id: string;
  entries: number;
  buckets: PayoutBucket[];
  minCash?: number | null;
}
