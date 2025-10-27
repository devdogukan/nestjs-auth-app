export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
