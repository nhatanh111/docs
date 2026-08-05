import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PartnersController } from './partners.controller';
import { PartnerMeController } from './partner-me.controller';
import { PartnersService } from './partners.service';
import { Partner } from './partner.entity';

@Module({
  imports: [SequelizeModule.forFeature([Partner])],
  controllers: [PartnersController, PartnerMeController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
