import { NextRequest, NextResponse } from 'next/server';
import {
  AnchorMode,
  broadcastTransaction,
  Cl,
  createMessageSignature,
  makeUnsignedContractCall,
  makeUnsignedSTXTokenTransfer,
  Pc,
  PostConditionMode,
  serializeTransaction,
  sigHashPreSign,
  SingleSigSpendingCondition,
  SingleSigSpendingConditionOpts,
  TransactionSigner,
} from '@stacks/transactions';
import { sha256 } from '@noble/hashes/sha256';
import { getPrivyServerClient } from '@/utils/privy-server-client';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { canonicalize } from 'json-canonicalize';
import { signRaw } from '@/utils/exportPrivyWallet';
import { formatStacksSignature } from '@/utils/stacks';
import { Braah_One } from 'next/font/google';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';



export const revalidate = 0;
export async function POST(request: NextRequest) {
  try {
    const { walletId } = await request.json();
    const accessToken = (await headers()).get('Authorization')?.replace('Bearer ', '');




    // Get the shared Privy client instance
    const privy = getPrivyServerClient();
    const allWallets = await privy.walletApi.getWallet({ id: walletId });
    const publicKey = allWallets.publicKey!
  // Add 0x prefix to publicKey if not present
    const formattedPublicKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;

    const currentWallet = 'STJ7N2FGH300NS65SHDBMWR42RAZGK3NN2CCAFV9'
    const amountInMicroSTX = 100000
    const tokenContract = 'SP11Z0M9SXMXM2BGQHDPT0B9Z03TDE56WFSF6EEX8.gm-stxcity' as `${string}.${string}`
    // Add post conditions - for buying, we send STX and expect to receive tokens
    
    
    const sendSTXPostCondition = Pc.principal(currentWallet)
    .willSendLte(BigInt(amountInMicroSTX))
    .ustx();
  
    
  const dexSendSTXPostCondition = Pc.principal('SP11Z0M9SXMXM2BGQHDPT0B9Z03TDE56WFSF6EEX8.gm-stxcity-dex')
    .willSendGte(BigInt(1000))
    .ft(tokenContract, 'GM');

  

    // STJ7N2FGH300NS65SHDBMWR42RAZGK3NN2CCAFV9.demo-1757662704359-1760

    

    const transaction = await makeUnsignedContractCall({
      publicKey: publicKey,
      contractAddress: 'STJ7N2FGH300NS65SHDBMWR42RAZGK3NN2CCAFV9',
      contractName: 'demo-1757662704359-1760',
      functionName: 'transfer', 
      functionArgs: [
        Cl.uint(BigInt(100000)),
        Cl.principal(currentWallet),
        Cl.principal('ST3HGE2GH9SAD0PKY66XAVA7F0G3CYVE1E1Z31YMC'),
        Cl.none()
      ],
      fee: 34604, // Increased fee for mainnet
      postConditionMode: 'allow',
      network: STACKS_TESTNET
    })

     // The `signer` contains the `sigHash` property needed for the `preSignSigHash`
    const signer = new TransactionSigner(transaction);

    let preSignSigHash = sigHashPreSign(
      signer.sigHash,
      transaction.auth.authType,
      transaction.auth.spendingCondition.fee,
      transaction.auth.spendingCondition.nonce,
    );
  

    const payload = `0x${preSignSigHash}`;


    const rawSignData = await signRaw(walletId, payload);
    const signature = rawSignData.data.signature;

    // Use the utility function to format the signature
    const { r, s, v, formatted: formattedSignature } = formatStacksSignature(signature);

    // Apply signature to transaction
    (transaction.auth.spendingCondition as SingleSigSpendingCondition).signature = createMessageSignature(formattedSignature);


     // 5. Broadcast the signed transaction
    
     const response: any = await broadcastTransaction({transaction: transaction, network: 'testnet' });
     console.log('Broadcast result:', response);
    
     // Extract txid from response
     const txid = response.txid || response;

    // if (!accessToken) {
    //   return NextResponse.json(
    //     { error: 'Missing access token' },
    //     { status: 401 }
    //   );
    // }


    // Check if the response is an error (transaction rejected)
    if (response.error) {
      // Transaction was rejected but we still have a txid
      return NextResponse.json({
        success: false,
        error: response.error,
        reason: response.reason,
        reason_data: response.reason_data,
        txid: response.txid,
        walletId: walletId,
        note: `Transaction rejected: ${response.error} - ${response.reason}`,
      }, { status: 400 });
    }
    
    // console.log('Raw sign successful:', signData);

    const transactionInfo = {
      type: 'Buy Meme Token',
      network: 'mainnet',
      amount: '0.1 STX',
      token: 'GM STXCITY',
      contractAddress: 'SP11Z0M9SXMXM2BGQHDPT0B9Z03TDE56WFSF6EEX8.gm-stxcity-dex',
      memo: 'Buying GM STXCITY meme token via Privy',
    };

    // Return txid in the expected format
    return NextResponse.json({
      txid: txid,
      success: true,
      signature: rawSignData.data.signature,
      decodedSignature: {
        r,
        s,
        v,
        formatted: formattedSignature
      },
      hash: payload,
      walletId: walletId,
      transactionInfo,
      broadcastResult: response,
      authenticationData: rawSignData,
      signatureData: rawSignData.data.signature,
      note: 'Meme token purchase transaction signed successfully via HTTP API',
    });

  } catch (error) {
    console.error('Sign raw API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



