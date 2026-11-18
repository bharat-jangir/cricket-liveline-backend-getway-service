import { IsArray, IsBoolean, IsIn, IsMongoId, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min, Max, ValidateIf } from 'class-validator';

const STATUS = ['draft', 'published', 'archived'];
const CATEGORIES = ['general', 'match-report', 'analysis', 'preview', 'tournament', 'transfers', 'rules', 'venues', 'interview'];
const URL_OPTS = { protocols: ['http', 'https'], require_protocol: true };

export class CreateArticleDto {
  @IsString() @MaxLength(200) title: string;
  @IsOptional() @IsString() @MaxLength(500) summary?: string;
  @IsString() @MaxLength(50000) body: string;
  @IsOptional() @IsIn(CATEGORIES) category?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @ValidateIf((o) => o.coverImage !== '' && o.coverImage !== null) @IsUrl(URL_OPTS) coverImage?: string | null;
  @IsOptional() @IsIn(STATUS) status?: string;
  @IsOptional() @IsString() publishedAt?: string | null;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @ValidateIf((o) => o.seriesId !== '' && o.seriesId !== null) @IsMongoId() seriesId?: string | null;
  @IsOptional() @ValidateIf((o) => o.matchId !== '' && o.matchId !== null) @IsMongoId() matchId?: string | null;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(500) summary?: string;
  @IsOptional() @IsString() @MaxLength(50000) body?: string;
  @IsOptional() @IsIn(CATEGORIES) category?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @ValidateIf((o) => o.coverImage !== '' && o.coverImage !== null) @IsUrl(URL_OPTS) coverImage?: string | null;
  @IsOptional() @IsIn(STATUS) status?: string;
  @IsOptional() @IsString() publishedAt?: string | null;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @ValidateIf((o) => o.seriesId !== '' && o.seriesId !== null) @IsMongoId() seriesId?: string | null;
  @IsOptional() @ValidateIf((o) => o.matchId !== '' && o.matchId !== null) @IsMongoId() matchId?: string | null;
}

export class CreateShortDto {
  @IsString() @MaxLength(150) title: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsUrl(URL_OPTS) videoUrl: string;
  @IsOptional() @ValidateIf((o) => o.thumbnail !== '' && o.thumbnail !== null) @IsUrl(URL_OPTS) thumbnail?: string | null;
  @IsOptional() @IsNumber() @Min(0) @Max(3600) durationSec?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsIn(STATUS) status?: string;
  @IsOptional() @IsString() publishedAt?: string | null;
  @IsOptional() @ValidateIf((o) => o.matchId !== '' && o.matchId !== null) @IsMongoId() matchId?: string | null;
}

export class UpdateShortDto {
  @IsOptional() @IsString() @MaxLength(150) title?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsUrl(URL_OPTS) videoUrl?: string;
  @IsOptional() @ValidateIf((o) => o.thumbnail !== '' && o.thumbnail !== null) @IsUrl(URL_OPTS) thumbnail?: string | null;
  @IsOptional() @IsNumber() @Min(0) @Max(3600) durationSec?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsIn(STATUS) status?: string;
  @IsOptional() @IsString() publishedAt?: string | null;
  @IsOptional() @ValidateIf((o) => o.matchId !== '' && o.matchId !== null) @IsMongoId() matchId?: string | null;
}

export class LikeDto {
  @IsBoolean() like: boolean;
}
