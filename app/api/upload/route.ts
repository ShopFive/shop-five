import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Starting R2 upload...');
    
    // Validate environment variables
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME || 
        !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || 
        !process.env.R2_PUBLIC_URL) {
      console.error('❌ Missing R2 environment variables!');
      return NextResponse.json(
        { error: 'Server configuration error', details: 'R2 credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize R2 client
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    
    const formData = await request.formData();
    const category = formData.get('category') as string;
    const timestamp = formData.get('timestamp') as string;
    const side = formData.get('side') as string;
    const imageFile = formData.get('image_0') as File;

    if (!category || !imageFile || !timestamp || !side) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📊 Received:', {
      category,
      timestamp,
      side,
      fileName: imageFile.name,
      size: (imageFile.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    // Convert to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // CRITICAL: Use the EXACT filename from Next.js - DO NOT modify it!
    const fileName = `${category}/${imageFile.name}`;

    console.log('☁️ Final filename for R2:', fileName);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: imageFile.type,
      Metadata: {
        'original-name': imageFile.name,
        'category': category,
        'timestamp': timestamp,
        'side': side,
        'upload-date': new Date().toISOString(),
        'size': imageFile.size.toString()
      }
    });

    await r2Client.send(command);

    console.log('✅ Uploaded successfully to R2!');

    // Construct public URL
    const imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    // Trigger n8n workflow
    console.log('🔔 Triggering n8n workflow...');
    
    try {
      const n8nResponse = await fetch('https://n8n.srv880249.hstgr.cloud/webhook/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          category,
          fileName,
          timestamp,
          side,
          size: imageFile.size
        })
      });

      if (!n8nResponse.ok) {
        console.warn('⚠️ n8n webhook failed');
      } else {
        console.log('✅ n8n workflow triggered!');
      }
    } catch (error) {
      console.error('❌ n8n webhook error:', error);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${side} image`,
      imageUrl,
      fileName,
      timestamp,
      side
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