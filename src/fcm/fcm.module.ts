import { Module } from '@nestjs/common';
import { FcmService } from '@src/fcm/fcm.service';

@Module({
    providers: [FcmService],
    exports: [FcmService],
})

export class FcmModule {}