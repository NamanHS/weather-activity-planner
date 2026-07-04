import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { OpenMeteoClient } from './open-meteo.client';

@Module({
  imports: [HttpModule],
  providers: [OpenMeteoClient],
  exports: [OpenMeteoClient],
})
export class OpenMeteoModule {}
