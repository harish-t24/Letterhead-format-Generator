import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TemplatesModule } from '../templates/templates.module';
import { DatasetsModule } from '../datasets/datasets.module';

@Module({
  imports: [TemplatesModule, DatasetsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
