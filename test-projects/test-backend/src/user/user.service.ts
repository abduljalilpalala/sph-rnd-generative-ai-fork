import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import {
  BulkUploadResponseDto,
  BulkUploadError,
} from './dto/bulk-upload-response.dto';

interface UserRow {
  name?: string;
  email: string;
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

  async update(
    id: number,
    data: { name?: string; email?: string },
  ): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async bulkCreateFromExcel(
    file: Express.Multer.File | undefined,
  ): Promise<BulkUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.originalname.toLowerCase().slice(-5);
    if (!validExtensions.some((ext) => fileExtension.endsWith(ext))) {
      throw new BadRequestException(
        'Invalid file type. Only .xlsx and .xls files are allowed',
      );
    }

    let users: UserRow[];
    try {
      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      users = XLSX.utils.sheet_to_json<UserRow>(worksheet);
    } catch (error) {
      throw new BadRequestException(
        'Failed to parse Excel file. Please ensure it is a valid Excel file.',
      );
    }

    if (!users || users.length === 0) {
      throw new BadRequestException('Excel file is empty or has no data');
    }

    const errors: BulkUploadError[] = [];
    const validUsers: UserRow[] = [];

    // Validate each row
    users.forEach((user, index) => {
      const rowNumber = index + 2; // +2 because Excel rows start at 1 and first row is header

      // Validate required fields
      if (!user.email) {
        errors.push({
          row: rowNumber,
          email: user.email || '',
          name: user.name,
          error: 'Email is required',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        errors.push({
          row: rowNumber,
          email: user.email,
          name: user.name,
          error: 'Invalid email format',
        });
        return;
      }

      validUsers.push(user);
    });

    let created = 0;

    // Create users in batches with transaction
    if (validUsers.length > 0) {
      try {
        await this.prisma.$transaction(async (prisma) => {
          for (const user of validUsers) {
            try {
              await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name || null,
                },
              });
              created++;
            } catch (error) {
              // Handle unique constraint violation
              const rowIndex = users.findIndex((u) => u.email === user.email);
              const isPrismaError =
                error instanceof Prisma.PrismaClientKnownRequestError;
              errors.push({
                row: rowIndex + 2,
                email: user.email,
                name: user.name,
                error:
                  isPrismaError && error.code === 'P2002'
                    ? 'Email already exists'
                    : 'Failed to create user',
              });
            }
          }
        });
      } catch (error) {
        throw new BadRequestException('Failed to process bulk upload');
      }
    }

    return {
      success: created > 0,
      message:
        created > 0
          ? `Successfully created ${created} user(s)`
          : 'No users were created',
      created,
      failed: errors.length,
      errors,
    };
  }
}
