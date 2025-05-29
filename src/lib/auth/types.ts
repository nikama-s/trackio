export interface AccessTokenPayload {
  userId: string;
  email: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}

export interface RefreshTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
