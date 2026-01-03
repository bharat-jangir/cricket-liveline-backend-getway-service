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
import { CreateTeamDto } from '../../dto/admin/create-team.dto';
import { UpdateTeamDto } from '../../dto/admin/update-team.dto';
import { QueryTeamsDto } from '../../dto/admin/query-teams.dto';

@Controller('admin/teams')
export class AdminTeamsController {
  constructor(private readonly mainAppService: MainAppService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createTeamDto: CreateTeamDto) {
    const result = await this.mainAppService.send('teams.create', createTeamDto);
    
    // Return data - ResponseInterceptor will format it
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.CREATED,
      status: true,
      userMessage: 'Team created successfully',
      userMessageCode: 'TEAM_CREATED',
      developerMessage: 'Team created successfully',
      data: result || {},
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: QueryTeamsDto) {
    const result = await this.mainAppService.send('teams.findAll', query);
    
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Teams retrieved successfully',
      userMessageCode: 'TEAMS_RETRIEVED',
      developerMessage: 'Teams retrieved successfully',
      data: result || {},
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const result = await this.mainAppService.send('teams.findOne', id);
    
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Team retrieved successfully',
      userMessageCode: 'TEAM_RETRIEVED',
      developerMessage: 'Team retrieved successfully',
      data: result || {},
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    const result = await this.mainAppService.send('teams.update', { id, updateTeamDto });
    
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Team updated successfully',
      userMessageCode: 'TEAM_UPDATED',
      developerMessage: 'Team updated successfully',
      data: result || {},
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.mainAppService.send('teams.remove', id);
    
    if (result && typeof result === 'object' && 'status' in result && 'data' in result) {
      return result;
    }
    
    return {
      statusCode: HttpStatus.OK,
      status: true,
      userMessage: 'Team deleted successfully',
      userMessageCode: 'TEAM_DELETED',
      developerMessage: 'Team deleted successfully',
      data: result || {},
    };
  }
}

