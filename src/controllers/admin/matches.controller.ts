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
import { CreateMatchDto } from '../../dto/admin/create-match.dto';
import { UpdateMatchDto } from '../../dto/admin/update-match.dto';
import { QueryMatchesDto } from '../../dto/admin/query-matches.dto';

@Controller('admin/matches')
export class AdminMatchesController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createMatchDto: CreateMatchDto) {
    const result = await this.mainAppService.send('matches.create', createMatchDto);
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: QueryMatchesDto) {
    const result = await this.mainAppService.send('matches.findAll', query);
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.mainAppService.send('matches.findOne', id);
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
    const result = await this.mainAppService.send('matches.update', { id, updateMatchDto });
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.mainAppService.send('matches.remove', id);
    return result;
  }
}

