import fs from 'fs/promises'
import path from 'path'

/**
 * Read the raw bytes of a private-media file, regardless of whether
 * storage is local disk (development) or S3/R2 (production).
 */
export async function readPrivateFileBuffer(filename: string): Promise<Buffer> {
  if (process.env.S3_BUCKET) {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    })
    const res = await client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `private/${filename}`,
      }),
    )
    if (!res.Body) throw new Error(`Empty S3 body for private/${filename}`)
    return Buffer.from(await res.Body.transformToByteArray())
  }
  return fs.readFile(path.resolve(process.cwd(), 'private-media', filename))
}
