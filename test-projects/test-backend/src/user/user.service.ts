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

    // Create users in batches with optimized batch processing
    if (validUsers.length > 0) {
      // Check for duplicate emails within the file
      const emailSet = new Set<string>();
      const duplicateEmails = new Set<string>();

      validUsers.forEach((user) => {
        if (emailSet.has(user.email)) {
          duplicateEmails.add(user.email);
        } else {
          emailSet.add(user.email);
        }
      });

      // Report duplicate emails within the file
      if (duplicateEmails.size > 0) {
        validUsers.forEach((user, index) => {
          if (duplicateEmails.has(user.email)) {
            const rowIndex = users.findIndex((u) => u.email === user.email);
            errors.push({
              row: rowIndex + 2,
              email: user.email,
              name: user.name,
              error: 'Duplicate email in file',
            });
          }
        });
      }

      // Filter out users with duplicate emails
      const uniqueUsers = validUsers.filter(
        (user) => !duplicateEmails.has(user.email),
      );

      // Check for existing emails in database
      const existingUsers = await this.prisma.user.findMany({
        where: {
          email: {
            in: uniqueUsers.map((u) => u.email),
          },
        },
        select: { email: true },
      });

      const existingEmails = new Set(existingUsers.map((u) => u.email));

      // Separate users into new and existing
      const newUsers: UserRow[] = [];
      uniqueUsers.forEach((user) => {
        if (existingEmails.has(user.email)) {
          const rowIndex = users.findIndex((u) => u.email === user.email);
          errors.push({
            row: rowIndex + 2,
            email: user.email,
            name: user.name,
            error: 'Email already exists in database',
          });
        } else {
          newUsers.push(user);
        }
      });

      // Batch insert all new users at once
      if (newUsers.length > 0) {
        try {
          const BATCH_SIZE = 500; // Process in chunks of 500 for very large datasets
          for (let i = 0; i < newUsers.length; i += BATCH_SIZE) {
            const batch = newUsers.slice(i, i + BATCH_SIZE);
            const result = await this.prisma.user.createMany({
              data: batch.map((user) => ({
                email: user.email,
                name: user.name || null,
              })),
              skipDuplicates: true, // Skip any duplicates that might occur
            });
            created += result.count;
          }
        } catch (error) {
          throw new BadRequestException(
            'Failed to process bulk upload: Database error',
          );
        }
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
