export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}


export interface ApiError {
  message: string;
}