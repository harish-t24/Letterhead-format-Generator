import { Module } from '@nestjs/common';
import { DatasetsController } from './datasets.controller';
import { DatasetsSummaryController } from './datasets-summary.controller';
import { DatasetsService } from './datasets.service';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [TemplatesModule],
  controllers: [DatasetsController, DatasetsSummaryController],
  providers: [DatasetsService],
  exports: [DatasetsService],
})
export class DatasetsModule {}
