import { mocked } from 'ts-jest/utils';
import { getUseCases, createUseCase, updateUseCase, deleteUseCase } from '../../lib/api/use-cases'; // Adjust path as necessary

// Mock the apiClient
// Assuming apiClient is imported and used within use-cases.ts
// If use-cases.ts directly uses Supabase, mock that instead.
// For this example, we'll mock a hypothetical apiClient.
const mockApiClient = {
  getUseCases: jest.fn(),
  createUseCase: jest.fn(),
  updateUseCase: jest.fn(),
  deleteUseCase: jest.fn(),
};

jest.mock('../../lib/api/client', () => ({
  apiClient: mockApiClient,
}));

describe('useCases', () => {
  beforeEach(() => {
    mockApiClient.getUseCases.mockClear();
    mockApiClient.createUseCase.mockClear();
    mockApiClient.updateUseCase.mockClear();
    mockApiClient.deleteUseCase.mockClear();
  });

  it('should fetch use cases via API client', async () => {
    const mockCases = [{ id: 1, name: 'Test Case' }];
    mockApiClient.getUseCases.mockResolvedValue(mockCases);

    const cases = await getUseCases();
    expect(mockApiClient.getUseCases).toHaveBeenCalledTimes(1);
    expect(cases).toEqual(mockCases);
  });

  it('should create a use case via API client', async () => {
    const newCaseData = { name: 'New Case' };
    const createdCase = { id: 2, ...newCaseData };
    mockApiClient.createUseCase.mockResolvedValue(createdCase);

    const result = await createUseCase(newCaseData);
    expect(mockApiClient.createUseCase).toHaveBeenCalledWith(newCaseData);
    expect(result).toEqual(createdCase);
  });

  it('should update a use case via API client', async () => {
    const updatedCaseData = { id: 2, name: 'Updated Case' };
    mockApiClient.updateUseCase.mockResolvedValue(updatedCaseData);

    const result = await updateUseCase(updatedCaseData.id, updatedCaseData);
    expect(mockApiClient.updateUseCase).toHaveBeenCalledWith(updatedCaseData.id, updatedCaseData);
    expect(result).toEqual(updatedCaseData);
  });

  it('should delete a use case via API client', async () => {
    mockApiClient.deleteUseCase.mockResolvedValue({ success: true });

    const result = await deleteUseCase(2);
    expect(mockApiClient.deleteUseCase).toHaveBeenCalledWith(2);
    expect(result).toEqual({ success: true });
  });

  it('should handle errors when fetching use cases', async () => {
    const error = new Error('Failed to fetch');
    mockApiClient.getUseCases.mockRejectedValue(error);

    await expect(getUseCases()).rejects.toThrow('Failed to fetch');
  });
});