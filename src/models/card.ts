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
  number: string;
  csc: string;
  name: string;
  surname: string;
  type: 'visa' | 'mastercard';
  movements: Movement[]
}