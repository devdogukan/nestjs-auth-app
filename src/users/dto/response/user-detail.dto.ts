export class UserDetailDto {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserDetailDto>) {
    Object.assign(this, partial);
  }
}
