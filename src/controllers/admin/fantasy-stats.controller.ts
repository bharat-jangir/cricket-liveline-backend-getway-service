import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';
import { CreateFantasyStatsDto } from '../../dto/admin/create-fantasy-stats.dto';
import { UpdateFantasyStatsDto } from '../../dto/admin/update-fantasy-stats.dto';
import { QueryFantasyStatsDto } from '../../dto/admin/query-fantasy-stats.dto';
import { BulkCreateFantasyStatsDto } from '../../dto/admin/bulk-create-fantasy-stats.dto';

// MongoDB ObjectId validation regex (24 hex characters)
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

@Controller('admin/series/:seriesId/fantasy-stats')
export class AdminFantasyStatsController {
  private readonly logger = new Logger(AdminFantasyStatsController.name);

  constructor(private readonly mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Param('seriesId') seriesId: string, @Body() createDto: CreateFantasyStatsDto) {
    try {
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }

      const result = await this.mainAppService.send('fantasy-stats.create', {
        seriesId,
        createDto,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in create', error.stack || error.message || error);
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Param('seriesId') seriesId: string, @Query() query: QueryFantasyStatsDto) {
    try {
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }

      const result = await this.mainAppService.send('fantasy-stats.findAll', {
        seriesId,
        query,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in findAll', error.stack || error.message || error);
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('seriesId') seriesId: string, @Param('id') id: string) {
    try {
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }
      if (!OBJECT_ID_REGEX.test(id)) {
        throw new BadRequestException('Invalid fantasy stats ID format');
      }

      const result = await this.mainAppService.send('fantasy-stats.findOne', id);
      return result;
    } catch (error: any) {
      this.logger.error('Error in findOne', error.stack || error.message || error);
      throw error;
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('seriesId') seriesId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateFantasyStatsDto,
  ) {
    try {
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }
      if (!OBJECT_ID_REGEX.test(id)) {
        throw new BadRequestException('Invalid fantasy stats ID format');
      }

      const result = await this.mainAppService.send('fantasy-stats.update', {
        id,
        updateDto,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in update', error.stack || error.message || error);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('seriesId') seriesId: string, @Param('id') id: string) {
    try {
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }
      if (!OBJECT_ID_REGEX.test(id)) {
        throw new BadRequestException('Invalid fantasy stats ID format');
      }

      const result = await this.mainAppService.send('fantasy-stats.remove', id);
      return result;
    } catch (error: any) {
      this.logger.error('Error in remove', error.stack || error.message || error);
      throw error;
    }
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async bulkCreate(
    @Param('seriesId') seriesId: string,
    @Body() bulkDto: BulkCreateFantasyStatsDto,
  ) {
    try {
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }

      const result = await this.mainAppService.send('fantasy-stats.bulkCreate', {
        seriesId,
        bulkDto,
      });
      return result;
    } catch (error: any) {
      this.logger.error('Error in bulkCreate', error.stack || error.message || error);
      throw error;
    }
  }
}

