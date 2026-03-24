export interface SignInResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}
