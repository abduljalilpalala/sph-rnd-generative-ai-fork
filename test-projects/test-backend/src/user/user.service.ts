import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

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

  async updateRole(
    id: number,
    role: UserRole,
    requestorRole: UserRole,
  ): Promise<User> {
    // Only admins can assign or remove roles
    if (requestorRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can assign or remove roles');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
