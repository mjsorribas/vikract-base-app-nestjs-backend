import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { File } from '../entities/file.entity';
import { LocalStorageProvider } from '../providers/local.provider';

describe('StorageService', () => {
  let service: StorageService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('local'),
  };

  const mockLocalProvider = {
    upload: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    getFileInfo: jest.fn(),
    listFiles: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: getRepositoryToken(File),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LocalStorageProvider,
          useValue: mockLocalProvider,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});