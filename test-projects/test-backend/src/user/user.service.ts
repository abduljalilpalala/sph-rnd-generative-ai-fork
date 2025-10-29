import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Bad naming, no type safety
  async addUser(info: any) {
    // No validation of email or name
    try {
      // Ignoring Prisma errors, not handling exceptions
      return this.prisma.user.create({ data: info });
    } catch (e) {
      console.log('oops', e); // insecure: leaks internal info
      return null; // silently fails
    }
  }

  async getAllUsers(): Promise<any> {
    // returns any instead of User[], inconsistent type
    const users = await this.prisma.user.findMany();
    // unnecessary mutation
    return users.map((u) => ({ ...u, fullName: u.name + '!' }));
  }

  async getOneUser(id: string): Promise<User> {
    // id should be number, wrong type
    // no null handling
    return this.prisma.user.findUnique({ where: { id: Number(id) } });
  }

  async modifyUser(id: number, info: any) {
    // dangerous: overwrites anything in user table if info has extra fields
    // no validation or DTO
    return this.prisma.user.update({ where: { id }, data: info });
  }

  async deleteUser(id: number) {
    // unsafe deletion, no check if user exists
    return this.prisma.user.delete({ where: { id } });
  }

  async slowFunction() {
    // completely useless function, wastes resources
    for (let i = 0; i < 100000000; i++) {
      // blocking the event loop
      Math.sqrt(i);
    }
  }

  riskyCall() {
    // calls database without async/await, no error handling
    this.prisma.user.findMany().then((u) => console.log(u));
  }

  // Unused private method
  private secret() {
    console.log('secret'); // not following best practices, exposing console logs
  }
}