import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Starting R2 upload...');
    
    const formData = await request.formData();
    const category = formData.get('category') as string;
    const imageFile = formData.get('image_0') as File;

    if (!category || !imageFile) {
      return NextResponse.json(
        { error: 'Missing category or image' },
        { status: 400 }
      );
    }

    console.log('📊 Image details:', {
      name: imageFile.name,
      size: (imageFile.size / 1024 / 1024).toFixed(2) + ' MB',
      type: imageFile.type,
      category: category
    });

    // Convert to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${category}/${timestamp}_${imageFile.name}`;

    console.log('☁️ Uploading to R2:', fileName);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: imageFile.type,
      Metadata: {
        'original-name': imageFile.name,
        'category': category,
        'upload-date': new Date().toISOString(),
        'size': imageFile.size.toString()
      }
    });

    await r2Client.send(command);

    console.log('✅ Uploaded successfully to R2!');

    // Construct public URL
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    // Trigger n8n workflow with image URL
    console.log('🔔 Triggering n8n workflow...');
    
    try {
      const n8nResponse = await fetch('https://n8n.srv880249.hstgr.cloud/webhook/process-r2-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          category,
          fileName,
          timestamp,
          size: imageFile.size
        })
      });

      if (!n8nResponse.ok) {
        console.warn('⚠️ n8n webhook failed, but image uploaded successfully');
      } else {
        console.log('✅ n8n workflow triggered!');
      }
    } catch (error) {
      console.error('❌ n8n webhook error:', error);
      // Continue anyway - image is uploaded
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded to ${category.toUpperCase()}`,
      imageUrl,
      fileName,
      size: imageFile.size
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}