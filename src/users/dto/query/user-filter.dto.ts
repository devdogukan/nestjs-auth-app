import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { Role } from "src/auth/enums/role.enum";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class UserFilterDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  email?: string;

  @IsOptional()
  name?: string;
}
