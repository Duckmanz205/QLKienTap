import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * R2StorageService — Service lưu trữ file trên Cloudflare R2.
 *
 * R2 sử dụng S3-compatible API, nên toàn bộ code này cũng hoạt động
 * với AWS S3 hoặc MinIO chỉ bằng cách đổi endpoint + credentials.
 *
 * Buckets:
 *   - qlkientap-reports      : Bài thu hoạch SV (PDF, DOCX)
 *   - qlkientap-payments     : Minh chứng thanh toán (ảnh JPG/PNG)
 *   - qlkientap-attachments  : File đính kèm thông báo, đơn hoàn phí
 */
@Injectable()
export class R2StorageService implements OnModuleInit {
  private s3: S3Client | null = null;
  private readonly logger = new Logger(R2StorageService.name);
  private isConfigured = false;

  // Tên bucket mặc định
  readonly BUCKET_REPORTS: string;
  readonly BUCKET_PAYMENTS: string;
  readonly BUCKET_ATTACHMENTS: string;
  
  readonly PUBLIC_URL_REPORTS: string;
  readonly PUBLIC_URL_PAYMENTS: string;
  readonly PUBLIC_URL_ATTACHMENTS: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.BUCKET_REPORTS = this.config.get('R2_BUCKET_REPORTS', 'qlkientap-reports');
    this.BUCKET_PAYMENTS = this.config.get('R2_BUCKET_PAYMENTS', 'qlkientap-payments');
    this.BUCKET_ATTACHMENTS = this.config.get('R2_BUCKET_ATTACHMENTS', 'qlkientap-attachments');
    
    this.PUBLIC_URL_REPORTS = this.config.get('R2_PUBLIC_URL_REPORTS', '');
    this.PUBLIC_URL_PAYMENTS = this.config.get('R2_PUBLIC_URL_PAYMENTS', '');
    this.PUBLIC_URL_ATTACHMENTS = this.config.get('R2_PUBLIC_URL_ATTACHMENTS', '');
    this.publicUrl = this.config.get('R2_PUBLIC_URL', '');
  }

  async onModuleInit() {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        '⚠️  R2 credentials chưa được cấu hình trong .env — ' +
        'Upload sẽ fallback về lưu local disk. ' +
        'Thêm R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY vào backend/.env để kích hoạt.',
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });

      // Kiểm tra kết nối bằng HEAD bucket
      await this.s3.send(new HeadBucketCommand({ Bucket: this.BUCKET_REPORTS }));
      this.isConfigured = true;
      this.logger.log('✅ Cloudflare R2 connected successfully');
    } catch (err) {
      this.logger.warn(
        `⚠️  Không thể kết nối R2 (${err.message}). Fallback về local disk.`,
      );
      this.isConfigured = false;
    }
  }

  /** Kiểm tra R2 đã sẵn sàng chưa */
  isReady(): boolean {
    return this.isConfigured && this.s3 !== null;
  }

  /**
   * Upload file lên R2.
   * @returns Object chứa key (đường dẫn trên R2) và url (public hoặc signed).
   */
  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer,
    contentType: string,
    publicUrlOverride?: string,
  ): Promise<{ key: string; url: string }> {
    if (!this.isReady()) {
      throw new Error('R2 Storage chưa được cấu hình. Kiểm tra .env');
    }

    await this.s3!.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    this.logger.log(`📁 Uploaded: ${bucket}/${key} (${contentType})`);

    // Chọn public URL ưu tiên: override từ Controller -> global publicUrl -> signed URL fallback
    let url: string;
    const resolvedPublicUrl = publicUrlOverride || this.publicUrl;
    if (resolvedPublicUrl) {
      url = `${resolvedPublicUrl}/${key}`;
    } else {
      url = await this.getSignedUrl(bucket, key, 7200); // 2 giờ
    }

    return { key, url };
  }

  /**
   * Tạo signed URL để download file (có thời hạn).
   * Dùng cho bucket private — GV/SV click download → backend trả signed URL.
   */
  async getSignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    if (!this.isReady()) {
      throw new Error('R2 Storage chưa được cấu hình.');
    }

    return getSignedUrl(
      this.s3!,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn },
    );
  }

  /** Xóa file trên R2 */
  async deleteFile(bucket: string, key: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('R2 Storage chưa được cấu hình.');
    }

    await this.s3!.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    );
    this.logger.log(`🗑️ Deleted: ${bucket}/${key}`);
  }

  /**
   * Tạo key (đường dẫn file) chuẩn hóa.
   * Format: <loai>/<mssv-hoặc-magv>/<timestamp>-<originalname>
   */
  generateKey(prefix: string, userId: string, originalName: string): string {
    const timestamp = Date.now();
    const safeName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Loại bỏ ký tự đặc biệt
      .substring(0, 100); // Giới hạn độ dài
    return `${prefix}/${userId}/${timestamp}-${safeName}`;
  }
}
