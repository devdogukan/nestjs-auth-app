import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { EmailService } from "src/email/email.service";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";

import { LoginDto } from "./dto/request/login-request.dto";
import { RegisterDto } from "./dto/request/register-request.dto";
import { VerifyEmailDto } from "./dto/request/verify-email-request.dto";
import { ResendVerificationDto } from "./dto/request/resend-verification-request.dto";
import { ForgotPasswordDto } from "./dto/request/forgot-password-request.dto";
import { ResetPasswordDto } from "./dto/request/reset-password-request.dto";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; email: string }> {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await this.usersService.updateEmailVerificationToken(user.id, verificationToken);

    await this.emailService.sendVerificationEmail(user.email, verificationToken, user.name);

    return {
      message: "Registration successful. Please check your email to verify your account.",
      email: user.email,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<AuthResponse> {
    const user = await this.usersService.verifyEmail(verifyEmailDto.token);

    await this.emailService.sendWelcomeEmail(user.email, user.name);

    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async resendVerificationToken(
    resendVerificationDto: ResendVerificationDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(resendVerificationDto.email);

    if (!user) {
      return {
        message: "If an account with that email exists, a verification email has been sent.",
      };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("The email account has already been verified.");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await this.usersService.updateEmailVerificationToken(user.id, verificationToken);

    await this.emailService.sendVerificationEmail(user.email, verificationToken, user.name);

    return { message: "The verification email has been resent." };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user.isEmailVerified) {
      throw new UnauthorizedException("Please verify your email before logging in.");
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async forgotPassword(forgotPassWordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPassWordDto.email);
    if (!user) {
      return { message: "If an account with that email exists, a password reset email has been sent." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000);

    await this.usersService.updatePasswordResetToken(user.id, resetToken, resetExpires);

    await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.name);

    return { message: "If an account with that email exists, a password reset email has been sent." };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.usersService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return { message: "Password has been reset successfully." };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("Invalid user");
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
    return;
  }

  //#region Private Functions
  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPassworValid = await bcrypt.compare(password, user.password);
    if (!isPassworValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return user;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow("JWT_SECRET"),
        expiresIn: this.configService.getOrThrow("JWT_EXPIRES_IN"),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.getOrThrow("JWT_REFRESH_EXPIRES_IN"),
      }),
    ]);

    return { accessToken, refreshToken };
  }
  //#endregion
}
