import { IsOptional, IsNumber, IsString, Min, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class FormatStatsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  matches?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  winBatFirst?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  winBowlFirst?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avg1stInn?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avg2ndInn?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avg3rdInn?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avg4thInn?: number;

  @IsOptional()
  @IsString()
  highestTotal?: string;

  @IsOptional()
  @IsMongoId()
  highestTotalMatchId?: string;

  @IsOptional()
  @IsString()
  lowestTotal?: string;

  @IsOptional()
  @IsMongoId()
  lowestTotalMatchId?: string;

  @IsOptional()
  @IsString()
  highestChased?: string;

  @IsOptional()
  @IsMongoId()
  highestChasedMatchId?: string;

  @IsOptional()
  @IsString()
  lowestDefended?: string;

  @IsOptional()
  @IsMongoId()
  lowestDefendedMatchId?: string;
}

export class UpsertVenueStatsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FormatStatsDto)
  odi?: FormatStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormatStatsDto)
  t20?: FormatStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormatStatsDto)
  firstClass?: FormatStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormatStatsDto)
  domesticT20?: FormatStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormatStatsDto)
  ipl?: FormatStatsDto;
}

