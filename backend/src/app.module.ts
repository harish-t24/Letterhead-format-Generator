import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TemplatesModule } from './templates/templates.module';
import { DatasetsModule } from './datasets/datasets.module';
import { ConversionModule } from './conversion/conversion.module';
import { RenderModule } from './render/render.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [TemplatesModule, DatasetsModule, ConversionModule, RenderModule, ExportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
