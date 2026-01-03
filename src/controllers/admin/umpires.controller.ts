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
import { MainAppService } from '../../services/main-app.service';
import { CreateUmpireDto } from '../../dto/admin/create-umpire.dto';
import { UpdateUmpireDto } from '../../dto/admin/update-umpire.dto';
import { QueryUmpiresDto } from '../../dto/admin/query-umpires.dto';

@Controller('admin/umpires')
export class AdminUmpiresController {
  private readonly logger = new Logger(AdminUmpiresController.name);

  constructor(private mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUmpireDto: CreateUmpireDto) {
    this.logger.debug('Creating umpire');
    const result = await this.mainAppService.send('umpires.create', createUmpireDto);
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryUmpiresDto) {
    this.logger.debug('Fetching umpires');
    const result = await this.mainAppService.send('umpires.findAll', query);
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    this.logger.debug(`Fetching umpire: ${id}`);
    const result = await this.mainAppService.send('umpires.findOne', id);
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUmpireDto: UpdateUmpireDto,
  ) {
    this.logger.debug(`Updating umpire: ${id}`);
    const result = await this.mainAppService.send('umpires.update', {
      id,
      updateUmpireDto,
    });
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.debug(`Deleting umpire: ${id}`);
    const result = await this.mainAppService.send('umpires.remove', id);
    return result;
  }
}

