import { IsMongoId, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class AddVenueToSeriesDto {
  @IsMongoId()
  venueId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}

