import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { SearchUserDto } from './dto/search-user.dto';

export interface SearchUserResult {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email: string }): Promise<User> {
    return this.prisma.user.create({ data });
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

  async search(searchDto: SearchUserDto): Promise<SearchUserResult> {
    const { name, email, page = 1, limit = 10 } = searchDto;

    // Build where clause for filtering
    const where: any = {};

    if (name || email) {
      where.AND = [];

      if (name) {
        where.AND.push({
          name: {
            contains: name,
            mode: 'insensitive',
          },
        });
      }

      if (email) {
        where.AND.push({
          email: {
            contains: email,
            mode: 'insensitive',
          },
        });
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
