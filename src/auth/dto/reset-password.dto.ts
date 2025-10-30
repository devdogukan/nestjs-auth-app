import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
    @ApiProperty({
        description: "Password reset token",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        required: true
    })
    @IsString()
    @IsNotEmpty({ message: "Reset token must not be empty" })
    token: string;

    @ApiProperty({
        description: "New password",
        example: "newSecurePassword123",
        minimum: 6,
        required: true
    })
    @IsString({ message: "Password must be a string" })
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    newPassword: string;
}