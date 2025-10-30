import { IsArray, IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "../enums/role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateRolesDto {
  @ApiProperty({
    description: "Array of user roles",
    example: [Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN],
    enum: Role,
    isArray: true,
    required: true
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsNotEmpty({ message: "Roles should not be empty" })
  roles: Role[];
}
