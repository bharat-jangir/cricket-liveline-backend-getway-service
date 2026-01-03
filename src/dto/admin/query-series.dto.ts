import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySeriesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['International', 'Domestic', 'League', 'Women'])
  seriesType?: string;

  @IsOptional()
  @IsString()
  category?: string; // Can be a single category or comma-separated (e.g., 'international,league')

  @IsOptional()
  @IsEnum(['ODI', 'T20', 'Test', 'T10', '100B'])
  format?: string;

  @IsOptional()
  @IsEnum(['Male', 'Female'])
  gender?: string;

  @IsOptional()
  @IsString()
  status?: string; // Can be a single status or comma-separated (e.g., 'running,upcoming')

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onHome?: boolean;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsString()
  startDateFrom?: string;

  @IsOptional()
  @IsString()
  startDateTo?: string;

  @IsOptional()
  @IsString()
  endDateFrom?: string;

  @IsOptional()
  @IsString()
  endDateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

