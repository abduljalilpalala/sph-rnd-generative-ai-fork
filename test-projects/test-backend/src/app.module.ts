import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [PrismaModule, UserModule, PostModule, RoleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
