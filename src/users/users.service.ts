import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Role } from "src/auth/enums/role.enum";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UserFilterDto } from "./dto/query/user-filter.dto";
import { UserDetailDto } from "./dto/response/user-detail.dto";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(email: string, password: string, name: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException("This email is already using");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      roles: [Role.USER],
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("User is not found");
    }

    user.refreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.usersRepository.save(user);

    return;
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.refreshToken) {
      return false;
    }

    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  async updateEmailVerificationToken(userId: string, token: string | null): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("User is not found");
    }

    user.emailVerificationToken = token;
    await this.usersRepository.save(user);

    return;
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { emailVerificationToken: token } });

    if (!user) {
      throw new NotFoundException("Invalid verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;

    return this.usersRepository.save(user);
  }

  async updatePasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { passwordResetToken: token, passwordResetExpires: expires },
    );
    return;
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { passwordResetToken: token } });

    if (!user) {
      throw new NotFoundException("Invalid reset token");
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new NotFoundException("Reset token has expired");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    return this.usersRepository.save(user);
  }

  async findAll(page: number, limit: number, filters: {
    role?: Role;
    isEmailVerified?: boolean;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<[User[], number]> {

    const query = this.usersRepository.createQueryBuilder(User.name);

    if (filters.role) {
      query.andWhere("User.roles LIKE :role", { role: `%${filters.role}%` });
    }

    if (filters.isEmailVerified !== undefined) {
      query.andWhere("User.isEmailVerified = :isEmailVerified", { isEmailVerified: filters.isEmailVerified });
    }

    if (filters.isActive !== undefined) {
      console.log("isActive filter applied:", filters.isActive);
      query.andWhere("User.isActive = :isActive", { isActive: filters.isActive });
    }

    if (filters.search) {
      query.andWhere("(User.name ILIKE :search OR User.email ILIKE :search)", {
        search: `%${filters.search}%`,
      });
    }

    query
      .select([
        "User.id",
        "User.email",
        "User.name",
        "User.roles",
        "User.isActive",
        "User.isEmailVerified",
        "User.createdAt",
        "User.updatedAt",
      ])
      .orderBy(`User.${filters.sortBy || "createdAt"}`, filters.sortOrder || "ASC")
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await query.getManyAndCount();
    return [users, total];
  }

  async updateUserRoles(userId: string, roles: Role[]): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("User is not found");
    }

    user.roles = roles;
    return this.usersRepository.save(user);
  }

  async deactivateUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("User is not found");
    }

    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async activateUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("User is not found");
    }

    user.isActive = true;
    return this.usersRepository.save(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("User is not found");
    }

    await this.usersRepository.remove(user);
    return;
  }
}
