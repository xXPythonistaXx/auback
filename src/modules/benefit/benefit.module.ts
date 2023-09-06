import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Benefit, BenefitSchema } from '@schemas';
import { BenefitController } from './benefit.controller';
import { BenefitService } from './benefit.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Benefit.name, schema: BenefitSchema }]),
  ],
  controllers: [BenefitController],
  providers: [BenefitService],
})
export class BenefitModule {}
