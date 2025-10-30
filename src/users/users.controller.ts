import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UsersService } from "./users.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/role.enum";
import { ApiBearerAuth, ApiOperation, ApiProperty } from "@nestjs/swagger";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { UpdateRolesDto } from "src/auth/dto/update-roles.dto";

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
  async getAllUsers() {
    const [users, count] = await this.usersService.findAll();
    return {
      message: "Users retrieved successfully",
      data: users,
      metadata: {
        total: count,
      },
    };
  }

  @Patch(":id/roles")
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user roles by ID (admin only)" })
  @ApiProperty({ description: "Update user roles by ID (admin only)" })
  async updateUserRoles(@Param("id") id: string, @Body() updateRolesDto: UpdateRolesDto) {
    const updatedUser = await this.usersService.updateUserRoles(id, updateRolesDto.roles);
    return {
      message: "User roles updated successfully",
      data: updatedUser,
    };
  }

  @Patch(":id/activate")
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Activate user by ID (admin only)" })
  @ApiProperty({ description: "Activate user by ID (admin only)" })
  async activateUser(@Param("id") id: string) {
    await this.usersService.activateUser(id);
    return {
      message: "User activated successfully",
    };
  }

  @Patch(":id/deactivate")
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deactivate user by ID (admin only)" })
  @ApiProperty({ description: "Deactivate user by ID (admin only)" })
  async deactivateUser(@Param("id") id: string) {
    await this.usersService.deactivateUser(id);
    return {
      message: "User deactivated successfully",
    };
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete user by ID (super admin only)" })
  @ApiProperty({ description: "Delete user by ID (super admin only)" })
  async deleteUser(@Param("id") id: string) {
    await this.usersService.deleteUser(id);
    return {
      message: "User deleted successfully",
    };
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiProperty({ description: "Get current user profile" })
  async getCurrentUser(@CurrentUser("userId") userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      message: "Current user retrieved successfully",
      data: user,
    };
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user by ID (admin only)" })
  @ApiProperty({ description: "Get user by ID (admin only)" })
  async getUserById(@Param("id") id: string) {
    const user = await this.usersService.findById(id);
    return {
      message: "User retrieved successfully",
      data: user,
    };
  }
}
