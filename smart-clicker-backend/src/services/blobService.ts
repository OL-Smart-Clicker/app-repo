import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();
const production = process.env.PRODUCTION === "true";

export class BlobService {
    private connectionString: string | undefined;
    private containerName: string;
    private blobServiceClient: BlobServiceClient;
    private containerClient: ContainerClient;

    constructor() {
        this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;
        if (production) {
            this.blobServiceClient = new BlobServiceClient(process.env.AZURE_STORAGE_ENDPOINT!, new DefaultAzureCredential())
        }
        else {
            this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
            this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
        }
        this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    }

    async uploadFloorPlan(officeId: string, fileBuffer: Buffer, mimeType: string): Promise<void> {
        await this.containerClient.createIfNotExists();

        const blobName = officeId;
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: mimeType }
        });
    }

    async getFloorPlan(officeId: string): Promise<{ base64: string, contentType: string } | null> {
        await this.containerClient.createIfNotExists();
        const blobName = officeId;
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        const exists = await blockBlobClient.exists();
        if (!exists) return null;
        const downloadResponse = await blockBlobClient.download();
        const chunks: Buffer[] = [];
        for await (const chunk of downloadResponse.readableStreamBody!) {
            if (Buffer.isBuffer(chunk)) {
                chunks.push(chunk);
            } else {
                chunks.push(Buffer.from(chunk));
            }
        }
        return {
            base64: Buffer.concat(chunks).toString('base64'),
            contentType: downloadResponse.contentType || 'application/octet-stream'
        };
    }
}