import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string }): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findOne(id: number): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async update(id: number, data: { name?: string; description?: string }): Promise<Role> {
    return this.prisma.role.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Role> {
    return this.prisma.role.delete({ where: { id } });
  }
}
