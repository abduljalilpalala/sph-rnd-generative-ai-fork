import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bulkCreateFromExcel', () => {
    it('should throw error when no file is provided', async () => {
      await expect(service.bulkCreateFromExcel(null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid file type', async () => {
      const file = {
        originalname: 'test.txt',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      await expect(service.bulkCreateFromExcel(file)).rejects.toThrow(
        'Invalid file type. Only .xlsx and .xls files are allowed',
      );
    });

    it('should throw error when Excel file is empty', async () => {
      const worksheet = XLSX.utils.json_to_sheet([]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const file = {
        originalname: 'test.xlsx',
        buffer,
      } as Express.Multer.File;

      await expect(service.bulkCreateFromExcel(file)).rejects.toThrow(
        'Excel file is empty or has no data',
      );
    });

    it('should validate email format and return errors', async () => {
      const data = [
        { email: 'invalid-email', name: 'Test User' },
        { email: '', name: 'No Email' },
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const file = {
        originalname: 'test.xlsx',
        buffer,
      } as Express.Multer.File;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      const result = await service.bulkCreateFromExcel(file);

      expect(result.success).toBe(false);
      expect(result.created).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe('Invalid email format');
      expect(result.errors[1].error).toBe('Email is required');
    });

    it('should successfully create users from valid Excel file', async () => {
      const data = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'user2@example.com', name: 'User 2' },
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const file = {
        originalname: 'test.xlsx',
        buffer,
      } as Express.Multer.File;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      mockPrismaService.user.create
        .mockResolvedValueOnce({
          id: 1,
          email: 'user1@example.com',
          name: 'User 1',
        })
        .mockResolvedValueOnce({
          id: 2,
          email: 'user2@example.com',
          name: 'User 2',
        });

      const result = await service.bulkCreateFromExcel(file);

      expect(result.success).toBe(true);
      expect(result.created).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.message).toBe('Successfully created 2 user(s)');
    });

    it('should handle duplicate emails gracefully', async () => {
      const data = [
        { email: 'user1@example.com', name: 'User 1' },
        { email: 'duplicate@example.com', name: 'Duplicate' },
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const file = {
        originalname: 'test.xlsx',
        buffer,
      } as Express.Multer.File;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      mockPrismaService.user.create
        .mockResolvedValueOnce({
          id: 1,
          email: 'user1@example.com',
          name: 'User 1',
        })
        .mockRejectedValueOnce({
          code: 'P2002',
          message: 'Unique constraint failed',
        });

      const result = await service.bulkCreateFromExcel(file);

      expect(result.success).toBe(true);
      expect(result.created).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Email already exists');
    });

    it('should handle mixed valid and invalid data', async () => {
      const data = [
        { email: 'valid@example.com', name: 'Valid User' },
        { email: 'invalid-email', name: 'Invalid' },
        { email: 'another@example.com', name: 'Another Valid' },
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const file = {
        originalname: 'test.xlsx',
        buffer,
      } as Express.Multer.File;

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });

      mockPrismaService.user.create
        .mockResolvedValueOnce({
          id: 1,
          email: 'valid@example.com',
          name: 'Valid User',
        })
        .mockResolvedValueOnce({
          id: 2,
          email: 'another@example.com',
          name: 'Another Valid',
        });

      const result = await service.bulkCreateFromExcel(file);

      expect(result.success).toBe(true);
      expect(result.created).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Invalid email format');
    });
  });
});
