import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CreateVenueDto } from '../../dto/admin/create-venue.dto';
import { UpdateVenueDto } from '../../dto/admin/update-venue.dto';
import { QueryVenueDto } from '../../dto/admin/query-venue.dto';
import { MainAppService } from '../../services/main-app.service';

@Controller('admin/venues')
export class AdminVenuesController {
  private readonly logger = new Logger(AdminVenuesController.name);

  constructor(private mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVenueDto: CreateVenueDto) {
    this.logger.debug('Sending create venue request to main-app');
    const result = await this.mainAppService.send('venues.create', createVenueDto);
    this.logger.debug('Received response from main-app');
    
    // Return data - ResponseInterceptor will format it
    // If result has standardized structure, return as-is, otherwise return data for interceptor to wrap
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    // Return data for interceptor to wrap in standard structure
    return {
      statusCode: HttpStatus.CREATED,
      status: true,
      userMessage: 'Venue created successfully',
      userMessageCode: 'VENUE_CREATED',
      developerMessage: 'Venue created successfully',
      data: result || {},
    };
  }

  @Get()
  async findAll(@Query() query: QueryVenueDto) {
    const result = await this.mainAppService.send('venues.findAll', query);
    
    // Return data - ResponseInterceptor will format it
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    // Return data for interceptor to wrap in standard structure
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Venues fetched successfully',
      userMessageCode: 'VENUES_FETCHED',
      developerMessage: 'Venues retrieved successfully',
      data: result || {},
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.mainAppService.send('venues.findOne', id);
    
    // Return data - ResponseInterceptor will format it
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    // Return data for interceptor to wrap in standard structure
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Venue fetched successfully',
      userMessageCode: 'VENUE_FETCHED',
      developerMessage: 'Venue retrieved successfully',
      data: result || {},
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto) {
    const result = await this.mainAppService.send('venues.update', { id, updateVenueDto });
    
    // Return data - ResponseInterceptor will format it
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    // Return data for interceptor to wrap in standard structure
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Venue updated successfully',
      userMessageCode: 'VENUE_UPDATED',
      developerMessage: 'Venue updated successfully',
      data: result || {},
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.mainAppService.send('venues.remove', id);
    
    // Return data - ResponseInterceptor will format it
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    // Return data for interceptor to wrap in standard structure
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Venue deleted successfully',
      userMessageCode: 'VENUE_DELETED',
      developerMessage: 'Venue deleted successfully',
      data: result || {},
    };
  }
}

