import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {

    constructor(
        private readonly seedService: SeedService,
        private readonly configService: ConfigService,
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Run the database seeder',
        description: 'Deletes all existing data and inserts fresh seed data. This route should only be used in development environments.'
    })
    runSeed() {
        const stage = this.configService.get<string>('STAGE');
        if (stage !== 'dev')
            throw new ForbiddenException('Seeding only allowed in development');

        return this.seedService.runSeed();
    }

}
