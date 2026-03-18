import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

// File size limits
const LIMITS = {
  image: 10 * 1024 * 1024, // 10MB for images
  video: 50 * 1024 * 1024, // 50MB for videos
};

// Allowed MIME types
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
};

interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: 'image' | 'video';
  uploadedAt: string;
}

function getFileType(mimeType: string): 'image' | 'video' | null {
  if (ALLOWED_TYPES.image.includes(mimeType)) return 'image';
  if (ALLOWED_TYPES.video.includes(mimeType)) return 'video';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`[Upload] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate file type
    const fileType = getFileType(file.type);
    if (!fileType) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: ${[
            ...ALLOWED_TYPES.image,
            ...ALLOWED_TYPES.video,
          ].join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const limit = LIMITS[fileType];
    if (file.size > limit) {
      return NextResponse.json(
        {
          error: `File too large. Max size for ${fileType}: ${limit / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Create unique filename with timestamp and random string
    const ext = file.name.split('.').pop();
    const filename = `${fileType}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    console.log(`[Upload] Uploading to Blob: ${filename}`);

    // Upload to Vercel Blob
    const buffer = await file.arrayBuffer();
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    });

    console.log(`[Upload] Successfully uploaded: ${blob.url}`);

    const response: UploadResponse = {
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: fileType,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Upload] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
