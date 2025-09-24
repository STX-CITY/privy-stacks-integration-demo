import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const { walletId, publicKey } = await request.json();

    if (!walletId) {
      return NextResponse.json(
        { error: 'Missing required parameter: walletId' },
        { status: 400 }
      );
    }

    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
    const privyAppSecret = process.env.PRIVY_APP_SECRET!;
    const quorumSecretKey = process.env.QUORUMS_PRIVATE_KEY!;
  

    if (!privyAppId || !privyAppSecret) {
      return NextResponse.json(
        { error: 'Missing Privy configuration' },
        { status: 500 }
      );
    }

    // Use provided public key or fallback to hardcoded one
    ;
    
    // Convert hex public key to Base64 for HPKE encryption
    const base64PublicKey = Buffer.from(publicKey, 'hex').toString('base64');

    // Make the API call to Privy
    const response = await fetch(`https://api.privy.io/v1/wallets/${walletId}/export`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(privyAppId + ':' + privyAppSecret)}`,
        'Content-Type': 'application/json',
        'privy-app-id': privyAppId,
        'privy-authorization-signature': quorumSecretKey
      },
      body: JSON.stringify({
        encryption_type: 'HPKE',
        recipient_public_key: publicKey,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Privy API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to export wallet key from Privy', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Export key API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}