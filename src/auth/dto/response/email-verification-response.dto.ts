export class EmailVerificationResponseDto {
  email: string;
  message: string;
  verified: boolean;

  constructor(email: string, verified: boolean = false) {
    this.email = email;
    this.verified = verified;
    this.message = verified ? "Email verified successfully" : "Email verification failed";
  }
}
