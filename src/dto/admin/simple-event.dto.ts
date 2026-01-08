import { IsString } from 'class-validator';

export class SimpleEventDto {
    @IsString()
    event: string;
}