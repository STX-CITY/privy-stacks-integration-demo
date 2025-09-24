import { NextRequest, NextResponse } from 'next/server';
import { getPrivyServerClient } from '@/utils/privy-server-client';
import { headers } from 'next/headers';

export const revalidate = 0;
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, chainType = 'ethereum' } = body;
    const accessToken = (await headers()).get('Authorization')?.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Get the shared Privy client instance
    const privy = getPrivyServerClient();

    // Create wallet for the specified user
    const result = await privy.walletApi.createWallet({
      chainType: 'bitcoin-segwit',
      owner: { userId: userId },
      additionalSigners: [{ signerId: process.env.QUORUMS_KEY!}]
    });

    return NextResponse.json({
      success: true,
      wallet: result
    });

  } catch (error) {
    console.error('Create wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



