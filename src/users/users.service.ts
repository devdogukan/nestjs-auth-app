import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  private users: User[] = [];

  async create(email: string, password: string, name: string): Promise<User> {
    const existingUser = this.users.find((u) => u.email == email);
    if (existingUser) {
      throw new ConflictException("This email is already using");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdAt = new Date();
    const user: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      createdAt: createdAt,
      updatedAt: createdAt,
    };

    this.users.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => (u.email = email));
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((u) => (u.id = id));
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const user = this.users.find((u) => (u.id = userId));
    if (!user) {
      throw new NotFoundException("User is not found");
    }

    user.refreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    user.updatedAt = new Date();

    return;
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = this.users.find((u) => (u.id = userId));
    if (!user || !user.refreshToken) {
      return false;
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    return isMatch;
  }
}
