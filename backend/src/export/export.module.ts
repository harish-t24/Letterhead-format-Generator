import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { RenderModule } from '../render/render.module';
import { TemplatesModule } from '../templates/templates.module';
import { DatasetsModule } from '../datasets/datasets.module';
import { ConversionModule } from '../conversion/conversion.module';

@Module({
  imports: [RenderModule, TemplatesModule, DatasetsModule, ConversionModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
