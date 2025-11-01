export class RegisterResponseDto {
  message: string;
  email: string;

  constructor(email: string, message?: string) {
    this.message = message || "User registered successfully";
    this.email = email;
  }
}
