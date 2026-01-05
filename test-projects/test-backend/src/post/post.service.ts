import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post, UserRole } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; content: string; authorId: number }): Promise<Post> {
    return this.prisma.post.create({
      data,
      include: {
        author: true,
      },
    });
  }

  async findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            reports: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            reports: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: { title?: string; content?: string },
    userId: number,
    userRole: UserRole,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Users can only edit their own posts
    // Moderators and admins can edit any post
    if (post.authorId !== userId && userRole === UserRole.USER) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data,
      include: {
        author: true,
      },
    });
  }

  async remove(id: number, userId: number, userRole: UserRole): Promise<Post> {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Users can only delete their own posts
    // Moderators and admins can delete any post
    if (post.authorId !== userId && userRole === UserRole.USER) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: { authorId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
