import { IsString, IsOptional } from 'class-validator';

export class SimpleEventDto {
    @IsString()
    event: string;

    @IsString()
    @IsOptional()
    bowlerName?: string;

    @IsString()
    @IsOptional()
    batsmanName?: string;
}