export class PasswordResetResponseDto {
  message: string;
  email?: string;

  constructor(message: string, email?: string) {
    this.message = message;
    this.email = email;
  }
}
