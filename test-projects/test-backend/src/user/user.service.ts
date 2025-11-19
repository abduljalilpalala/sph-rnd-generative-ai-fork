import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async search(searchDto: SearchUserDto): Promise<User[]> {
    const { name, email, page = 1, limit = 10 } = searchDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    }

    return this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string; email?: string }): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
