import { Test, TestingModule } from '@nestjs/testing';
import { LocalStorageProvider } from '../providers/local.provider';

jest.mock('fs');
jest.mock('fs-extra');
jest.mock('path');
jest.mock('uuid');
jest.mock('sharp');

describe('LocalStorageProvider', () => {
  let provider: LocalStorageProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStorageProvider],
    }).compile();

    provider = module.get<LocalStorageProvider>(LocalStorageProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});