import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { FileModule } from './file/file.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ProjectModule,
    TaskModule,
    FileModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
