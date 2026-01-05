import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { PostModule } from './post/post.module';
import { ReportModule } from './report/report.module';
import { ModerationLogModule } from './moderation-log/moderation-log.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';

@Module({
  imports: [PrismaModule, UserModule, PostModule, ReportModule, ModerationLogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
