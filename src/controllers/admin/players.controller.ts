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
import { CreatePlayerDto, UpdatePlayerDto, QueryPlayersDto } from '../../dto/admin/players.dto';

@Controller('admin/players')
export class AdminPlayersController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    const result = await this.mainAppService.send('players.create', createPlayerDto);
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPlayers(@Query() query: QueryPlayersDto) {
    const result = await this.mainAppService.send('players.findAll', query);
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPlayer(@Param('id') id: string) {
    const result = await this.mainAppService.send('players.findOne', id);
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePlayer(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    const result = await this.mainAppService.send('players.update', { id, updatePlayerDto });
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePlayer(@Param('id') id: string) {
    const result = await this.mainAppService.send('players.remove', id);
    return result;
  }
}

