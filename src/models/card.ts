export interface Movement {
  _id: string;
  type: 'in' | 'out',
  amount: number;
  title: string;
  description: string;
  timestamp: Date;
}

export interface Card {
  _id: string;
  owner: string;
  ownerId: string;
  amount: number;
  movements: Movement[]
}