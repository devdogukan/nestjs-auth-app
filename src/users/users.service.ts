import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Role } from "src/auth/enums/role.enum";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

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

  async findAll(): Promise<[User[], number]> {
    return this.usersRepository.findAndCount({
      select: [
        "id",
        "email",
        "name",
        "roles",
        "isEmailVerified",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    });
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
