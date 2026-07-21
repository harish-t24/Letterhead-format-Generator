import { Module } from '@nestjs/common';
import { RenderController } from './render.controller';
import { RenderService } from './render.service';
import { TemplatesModule } from '../templates/templates.module';
import { DatasetsModule } from '../datasets/datasets.module';
import { ConversionModule } from '../conversion/conversion.module';

@Module({
  imports: [TemplatesModule, DatasetsModule, ConversionModule],
  controllers: [RenderController],
  providers: [RenderService],
  exports: [RenderService],
})
export class RenderModule {}
