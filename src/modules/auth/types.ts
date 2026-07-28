export interface User {
  userId: string;
  email?: string;
  name?: string;
}

export interface KakaoLoginResponse {
  user: User;
}
