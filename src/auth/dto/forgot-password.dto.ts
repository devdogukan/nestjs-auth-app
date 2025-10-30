import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordDto {
    @ApiProperty({
        description: "User's email address",
        example: "user@example.com",
        required: true
    })
    @IsEmail({}, { message: "Please enter a valid email address" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;
}