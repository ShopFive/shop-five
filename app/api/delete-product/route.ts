import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productName, category } = body;

    // Validation
    if (!productId || !productName || !category) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: productId, productName, or category' 
        },
        { status: 400 }
      );
    }

    console.log('🗑️ Delete request received:', { productId, productName, category });

    // ============================================
    // n8n DELETE WEBHOOK CALL
    // ============================================
    
    const N8N_DELETE_WEBHOOK = 'https://n8n.srv880249.hstgr.cloud/webhook/delete-product';

    console.log('📤 Calling n8n delete webhook...');

    const webhookResponse = await fetch(N8N_DELETE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        productName,
        category,
        timestamp: Date.now(),
      }),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ n8n webhook error:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to delete product from Google Drive',
          error: errorText 
        },
        { status: 500 }
      );
    }

    const webhookResult = await webhookResponse.json();
    console.log('✅ Delete webhook result:', webhookResult);

    // Check if deletion was successful
    if (!webhookResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: webhookResult.message || 'Failed to delete product',
          deletedFiles: webhookResult.deletedFiles || 0,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: webhookResult.message || 'Product deleted successfully',
      deletedFiles: webhookResult.deletedFiles || 0,
      productName: webhookResult.productName,
      category: webhookResult.category,
    });

  } catch (error) {
    console.error('❌ Delete API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}