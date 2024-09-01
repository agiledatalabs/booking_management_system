export interface BlockedOrder {
  userId: string;
  resourceQty: number;
  timeout: NodeJS.Timeout;
  startTime: Date;
  duration: number; // Duration in milliseconds
}
