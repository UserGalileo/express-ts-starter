export interface RefreshToken {
  _id: string;
  // The user who this token belongs to
  userId: string;
  // The actual refresh token
  token: string;
  // Is this token invalid?
  invalid?: boolean;
  // What's the first token which generated this one? If null, this is the first token.
  // When a Reuse is detected, all the tokens with the same genesis are invalidated.
  // When the user logs out, all the tokens with the same genesis are removed.
  genesisToken?: string;
}