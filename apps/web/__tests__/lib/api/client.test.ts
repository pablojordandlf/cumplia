import { createClient } from '@supabase/supabase-js';
import { mocked } from 'ts-jest/utils'; // Assuming ts-jest is used
import { fetch } from 'jest-fetch-mock'; // Assuming jest-fetch-mock is used for mocking fetch

import { apiClient } from '../lib/api/client'; // Adjust path as necessary

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      data: [{ id: 1, name: 'Test Use Case' }],
      error: null,
    })),
    insert: jest.fn(() => ({
      data: [{ id: 1, name: 'New Use Case' }],
      error: null,
    })),
    update: jest.fn(() => ({
      data: [{ id: 1, name: 'Updated Use Case' }],
      error: null,
    })),
    delete: jest.fn(() => ({
      data: null,
      error: null,
    })),
  })),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('apiClient', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSupabaseClient.from.mockClear();
    (mockSupabaseClient.from('use_cases').select as jest.Mock).mockClear();
    (mockSupabaseClient.from('use_cases').insert as jest.Mock).mockClear();
    (mockSupabaseClient.from('use_cases').update as jest.Mock).mockClear();
    (mockSupabaseClient.from('use_cases').delete as jest.Mock).mockClear();
    fetch.resetMocks();
  });

  it('should fetch use cases', async () => {
    const cases = await apiClient.getUseCases();
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('use_cases');
    expect(mockSupabaseClient.from('use_cases').select).toHaveBeenCalledWith('*');
    expect(cases).toEqual([{ id: 1, name: 'Test Use Case' }]);
  });

  it('should create a use case', async () => {
    const newCase = { name: 'New Use Case' };
    const createdCase = await apiClient.createUseCase(newCase);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('use_cases');
    expect(mockSupabaseClient.from('use_cases').insert).toHaveBeenCalledWith(newCase);
    expect(createdCase).toEqual({ id: 1, name: 'New Use Case' });
  });

  it('should update a use case', async () => {
    const updatedCase = { id: 1, name: 'Updated Use Case' };
    await apiClient.updateUseCase(updatedCase.id, updatedCase);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('use_cases');
    expect(mockSupabaseClient.from('use_cases').update).toHaveBeenCalledWith(updatedCase).toHaveBeenCalledTimes(1);
  });

  it('should delete a use case', async () => {
    await apiClient.deleteUseCase(1);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('use_cases');
    expect(mockSupabaseClient.from('use_cases').delete).toHaveBeenCalledWith('id').toHaveBeenCalledTimes(1); // Assuming delete by 'id'
  });

  // Example test for a hypothetical fetch-based API, if your client also uses fetch
  it('should fetch data from a generic endpoint', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'Hello from API' }));
    const response = await fetch('/api/hello'); // Example endpoint
    expect(response).toEqual({ message: 'Hello from API' });
    expect(fetch).toHaveBeenCalledWith('/api/hello');
  });
});