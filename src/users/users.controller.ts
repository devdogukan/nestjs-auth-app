import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiProperty } from "@nestjs/swagger";

import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enum";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { ResponseHelper } from "src/common/helpers/response.helper";
import { UsersService } from "./users.service";

import {
  RoleUpdateResponseDto,
  UpdateRolesRequestDto,
  UserDetailDto,
  UserFilterDto,
} from "src/users/dto";


@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all users (admin only)" })
  @ApiProperty({ description: "Get all users (admin only)" })
  async getAllUsers(@Query() filterDto: UserFilterDto) {
    const { page = 1, limit = 10, ...filters } = filterDto;
    const [data, count] = await this.usersService.findAll(page, limit, filters);

    const users = data.map((user) => new UserDetailDto(user));
    return ResponseHelper.paginated(users, count, page, limit, "Users retrieved successfully");
  }

  @Patch(":id/roles")
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user roles by ID (admin only)" })
  @ApiProperty({ description: "Update user roles by ID (admin only)" })
  async updateUserRoles(@Param("id") id: string, @Body() updateRolesDto: UpdateRolesRequestDto) {
    const updatedUser = await this.usersService.updateUserRoles(id, updateRolesDto.roles);

    const response = new RoleUpdateResponseDto(updatedUser);
    return ResponseHelper.success("User roles updated successfully", response);
  }

  @Patch(":id/activate")
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Activate user by ID (admin only)" })
  @ApiProperty({ description: "Activate user by ID (admin only)" })
  async activateUser(@Param("id") id: string) {
    await this.usersService.activateUser(id);
    return ResponseHelper.success("User activated successfully");
  }

  @Patch(":id/deactivate")
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deactivate user by ID (admin only)" })
  @ApiProperty({ description: "Deactivate user by ID (admin only)" })
  async deactivateUser(@Param("id") id: string) {
    await this.usersService.deactivateUser(id);
    return ResponseHelper.success("User deactivated successfully");
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete user by ID (super admin only)" })
  @ApiProperty({ description: "Delete user by ID (super admin only)" })
  async deleteUser(@Param("id") id: string) {
    await this.usersService.deleteUser(id);
    return ResponseHelper.success("User deleted successfully");
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiProperty({ description: "Get current user profile" })
  async getCurrentUser(@CurrentUser("userId") userId: string) {
    const user = await this.usersService.findById(userId);

    const userDetail = new UserDetailDto(user);
    return ResponseHelper.success("User profile retrieved successfully", userDetail);
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user by ID (admin only)" })
  @ApiProperty({ description: "Get user by ID (admin only)" })
  async getUserById(@Param("id") id: string) {
    const user = await this.usersService.findById(id);
    
    const userDetail = new UserDetailDto(user);
    return ResponseHelper.success("User retrieved successfully", userDetail);
  }
}
