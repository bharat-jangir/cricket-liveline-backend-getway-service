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
} from '@nestjs/common';
import { MainAppService } from '../../services/main-app.service';
import { CreateSeriesDto } from '../../dto/admin/create-series.dto';
import { UpdateSeriesDto } from '../../dto/admin/update-series.dto';
import { QuerySeriesDto } from '../../dto/admin/query-series.dto';

@Controller('admin/series')
export class AdminSeriesController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createSeriesDto: CreateSeriesDto) {
    const result = await this.mainAppService.send('series.create', createSeriesDto);
    
    // Return data - ResponseInterceptor will format it
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.CREATED,
      status: true,
      userMessage: 'Series created successfully',
      userMessageCode: 'SERIES_CREATED',
      developerMessage: 'Series created successfully',
      data: result || {},
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: QuerySeriesDto) {
    const result = await this.mainAppService.send('series.findAll', query);
    
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Series retrieved successfully',
      userMessageCode: 'SERIES_RETRIEVED',
      developerMessage: 'Series retrieved successfully',
      data: result || {},
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.mainAppService.send('series.findOne', id);
    
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Series retrieved successfully',
      userMessageCode: 'SERIES_RETRIEVED',
      developerMessage: 'Series retrieved successfully',
      data: result || {},
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateSeriesDto: UpdateSeriesDto,
  ) {
    const result = await this.mainAppService.send('series.update', { id, updateSeriesDto });
    
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Series updated successfully',
      userMessageCode: 'SERIES_UPDATED',
      developerMessage: 'Series updated successfully',
      data: result || {},
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.mainAppService.send('series.remove', id);
    
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Series deleted successfully',
      userMessageCode: 'SERIES_DELETED',
      developerMessage: 'Series deleted successfully',
      data: result || {},
    };
  }
}

