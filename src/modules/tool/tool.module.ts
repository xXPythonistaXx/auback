import { Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tool, ToolSchema } from '@schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tool.name, schema: ToolSchema }]),
  ],
  providers: [ToolService],
  controllers: [ToolController],
})
export class ToolModule {}
