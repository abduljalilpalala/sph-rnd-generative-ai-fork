import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; content?: string }): Promise<Post> {
    return await this.prisma.post.create({ data });
  }

  async findAll(): Promise<Post[]> {
    return await this.prisma.post.findMany();
  }

  async findOne(id: number): Promise<Post | null> {
    return await this.prisma.post.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: { title?: string; content?: string },
  ): Promise<Post> {
    return await this.prisma.post.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Post> {
    return await this.prisma.post.delete({ where: { id } });
  }
}
