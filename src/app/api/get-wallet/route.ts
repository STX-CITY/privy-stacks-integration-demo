import { getPrivyServerClient } from '@/utils/privy-server-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Missing required parameter: walletId' },
        { status: 400 }
      );
    }


    // Get the shared Privy client instance
    const privy = getPrivyServerClient();

    const wallet = await privy.walletApi.getWallet({id: walletId});


    

    
    
    return NextResponse.json({
      success: true,
      data: wallet,
    });

  } catch (error) {
    console.error('Get wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}