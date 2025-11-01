import { Role } from "src/auth/enums/role.enum";

export class RoleUpdateResponseDto {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  message: string;

  constructor(partial: Partial<RoleUpdateResponseDto>) {
    Object.assign(this, partial);
  }
}
