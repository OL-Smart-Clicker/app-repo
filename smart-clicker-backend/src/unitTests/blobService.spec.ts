const mockUploadData = jest.fn();
const mockExists = jest.fn();
const mockDownload = jest.fn();
const mockGetBlockBlobClient = jest.fn().mockReturnValue({
    uploadData: mockUploadData,
    exists: mockExists,
    download: mockDownload
});
const mockCreateIfNotExists = jest.fn();

jest.mock('@azure/storage-blob', () => {
    return {
        BlobServiceClient: {
            fromConnectionString: jest.fn().mockReturnValue({
                getContainerClient: jest.fn().mockReturnValue({
                    createIfNotExists: mockCreateIfNotExists,
                    getBlockBlobClient: mockGetBlockBlobClient
                })
            })
        }
    };
});
jest.mock('../db/db', () => require('./mockDb'));

import { BlobService } from '../services/blobService';

describe('BlobService', () => {
    let blobService: BlobService;
    beforeEach(() => {
        blobService = new BlobService();
    });

    it('should instantiate without error', () => {
        expect(blobService).toBeDefined();
    });

    it('should upload a floor plan', async () => {
        await expect(blobService.uploadFloorPlan('office1', Buffer.from('test'), 'image/png')).resolves.toBeUndefined();
        expect(mockCreateIfNotExists).toHaveBeenCalled();
        expect(mockUploadData).toHaveBeenCalled();
    });

    it('should return null if floor plan does not exist', async () => {
        mockExists.mockResolvedValue(false);
        const result = await blobService.getFloorPlan('office1');
        expect(result).toBeNull();
    });

    it('should get floor plan if exists', async () => {
        const mockData = Buffer.from('abc');
        mockExists.mockResolvedValue(true);
        mockDownload.mockResolvedValue({
            readableStreamBody: [mockData][Symbol.iterator](),
            contentType: 'image/png'
        });
        const result = await blobService.getFloorPlan('office1');
        expect(result).toHaveProperty('base64');
        expect(result).toHaveProperty('contentType', 'image/png');
    });

    it('should handle error in uploadFloorPlan', async () => {
        mockUploadData.mockRejectedValueOnce(new Error('fail'));
        await expect(blobService.uploadFloorPlan('office1', Buffer.from('test'), 'image/png')).rejects.toThrow('fail');
    });

    it('should handle error in getFloorPlan', async () => {
        mockExists.mockRejectedValueOnce(new Error('fail'));
        await expect(blobService.getFloorPlan('office1')).rejects.toThrow('fail');
    });
});
