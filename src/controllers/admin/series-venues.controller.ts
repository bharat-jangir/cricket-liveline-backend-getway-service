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
import { AddVenueToSeriesDto } from '../../dto/admin/add-venue-to-series.dto';
import { UpdateSeriesVenueDto } from '../../dto/admin/update-series-venue.dto';
import { QuerySeriesVenuesDto } from '../../dto/admin/query-series-venues.dto';

// MongoDB ObjectId validation regex (24 hex characters)
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

@Controller('admin/series/:seriesId/venues')
export class AdminSeriesVenuesController {
  private readonly logger = new Logger(AdminSeriesVenuesController.name);

  constructor(private readonly mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async addVenueToSeries(@Param('seriesId') seriesId: string, @Body() addVenueDto: AddVenueToSeriesDto) {
    try {
      // Validate seriesId format
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }

      const result = await this.mainAppService.send('series-venues.add', {
        seriesId,
        addVenueDto,
      });
      return result;
    } catch (error) {
      this.logger.error('Error in addVenueToSeries', error.stack || error.message || error);
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getSeriesVenues(@Param('seriesId') seriesId: string, @Query() query: QuerySeriesVenuesDto) {
    try {
      // Validate seriesId format
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }

      const result = await this.mainAppService.send('series-venues.findAll', {
        seriesId,
        query,
      });
      return result;
    } catch (error) {
      this.logger.error('Error in getSeriesVenues', error.stack || error.message || error);
      throw error;
    }
  }

  @Put(':venueId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateSeriesVenue(
    @Param('seriesId') seriesId: string,
    @Param('venueId') venueId: string,
    @Body() updateDto: UpdateSeriesVenueDto,
  ) {
    try {
      // Validate IDs format
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }
      if (!OBJECT_ID_REGEX.test(venueId)) {
        throw new BadRequestException('Invalid venue ID format');
      }

      const result = await this.mainAppService.send('series-venues.update', {
        seriesId,
        venueId,
        updateDto,
      });
      return result;
    } catch (error) {
      this.logger.error('Error in updateSeriesVenue', error.stack || error.message || error);
      throw error;
    }
  }

  @Delete(':venueId')
  @HttpCode(HttpStatus.OK)
  async removeVenueFromSeries(@Param('seriesId') seriesId: string, @Param('venueId') venueId: string) {
    try {
      // Validate IDs format
      if (!OBJECT_ID_REGEX.test(seriesId)) {
        throw new BadRequestException('Invalid series ID format');
      }
      if (!OBJECT_ID_REGEX.test(venueId)) {
        throw new BadRequestException('Invalid venue ID format');
      }

      const result = await this.mainAppService.send('series-venues.remove', {
        seriesId,
        venueId,
      });
      return result;
    } catch (error) {
      this.logger.error('Error in removeVenueFromSeries', error.stack || error.message || error);
      throw error;
    }
  }
}

