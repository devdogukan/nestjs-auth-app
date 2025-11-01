import { UserResponseDto } from "./user-response.dto";

export class TokenResponseDto {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export class AuthResponseDto {
    user: UserResponseDto;
    token: TokenResponseDto;

    constructor(user: UserResponseDto, token: TokenResponseDto) {
        this.user = user;
        this.token = token;
    }
}