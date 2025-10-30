import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyEmailDto {
    @ApiProperty({
        description: "Email verification token",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        required: true
    })
    @IsString()
    @IsNotEmpty({ message: "Verification token must not be empty" })
    token: string;
}