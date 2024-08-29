export interface User {
  id_user: number;
  name: string;
  surname: string;
  email: string;
  photo?: string;
}

export interface UserResponse {
  code: number;
  message: string;
  data: User;
}
