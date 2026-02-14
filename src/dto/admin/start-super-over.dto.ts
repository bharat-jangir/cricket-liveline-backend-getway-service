import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class StartSuperOverDto {
    @IsString()
    @IsNotEmpty()
    matchId: string;
}
