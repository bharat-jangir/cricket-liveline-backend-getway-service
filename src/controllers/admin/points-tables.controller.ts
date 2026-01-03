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
import { CreatePointsTableEntryDto } from '../../dto/admin/create-points-table-entry.dto';
import { UpdatePointsTableEntryDto } from '../../dto/admin/update-points-table-entry.dto';
import { QueryPointsTableDto } from '../../dto/admin/query-points-table.dto';
import { CreatePointsTableGroupDto } from '../../dto/admin/create-points-table-group.dto';
import { BulkUpdatePointsTableDto } from '../../dto/admin/bulk-update-points-table.dto';

@Controller('admin/series/:seriesId/points-tables')
export class AdminPointsTablesController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Param('seriesId') seriesId: string, @Body() createDto: CreatePointsTableEntryDto) {
    const result = await this.mainAppService.send('points-tables.create', {
      ...createDto,
      seriesId,
    });
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Param('seriesId') seriesId: string, @Query() query: QueryPointsTableDto) {
    const result = await this.mainAppService.send('points-tables.findAll', {
      ...query,
      seriesId,
    });
    return result;
  }

  @Get('groups')
  @HttpCode(HttpStatus.OK)
  async getGroups(@Param('seriesId') seriesId: string, @Query('matchFormat') matchFormat?: string) {
    const result = await this.mainAppService.send('points-tables.getGroups', {
      seriesId,
      matchFormat,
    });
    return result;
  }

  @Post('groups')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createGroup(@Param('seriesId') seriesId: string, @Body() createGroupDto: CreatePointsTableGroupDto) {
    const result = await this.mainAppService.send('points-tables.createGroup', {
      seriesId,
      createGroupDto,
    });
    return result;
  }

  @Put('bulk')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async bulkUpdate(@Param('seriesId') seriesId: string, @Body() bulkUpdateDto: BulkUpdatePointsTableDto) {
    const result = await this.mainAppService.send('points-tables.bulkUpdate', {
      seriesId,
      bulkUpdateDto,
    });
    return result;
  }

  @Delete('groups/:groupName')
  @HttpCode(HttpStatus.OK)
  async deleteGroup(
    @Param('seriesId') seriesId: string,
    @Param('groupName') groupName: string,
    @Query('matchFormat') matchFormat?: string,
  ) {
    const result = await this.mainAppService.send('points-tables.deleteGroup', {
      seriesId,
      groupName,
      matchFormat,
    });
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.mainAppService.send('points-tables.findOne', id);
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateDto: UpdatePointsTableEntryDto) {
    const result = await this.mainAppService.send('points-tables.update', {
      id,
      updateDto,
    });
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.mainAppService.send('points-tables.remove', id);
    return result;
  }
}

