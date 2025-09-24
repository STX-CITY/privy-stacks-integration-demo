import { NextRequest, NextResponse } from 'next/server';
import {
  broadcastTransaction,
  createMessageSignature,
  makeUnsignedSTXTokenTransfer,
  publicKeyToAddress,
  serializeTransaction,
  sigHashPreSign,
  SingleSigSpendingCondition,
  TransactionSigner,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { sha256 } from '@noble/hashes/sha256';
import { getPrivyServerClient } from '@/utils/privy-server-client';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { canonicalize } from 'json-canonicalize';
import { signRaw } from '@/utils/exportPrivyWallet';
import { Braah_One } from 'next/font/google';
import { formatStacksSignature, generateAllSignatureVariants, broadcastWithRecoveryTesting } from '@/utils/stacks';

export const revalidate = 0;
export async function POST(request: NextRequest) {
  try {
    const { walletId, walletAddress } = await request.json();
    const accessToken = (await headers()).get('Authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    // Get the shared Privy client instance
    const privy = getPrivyServerClient();


    let verifiedClaims;
    try {
      verifiedClaims = await privy.verifyAuthToken(accessToken!);
      console.log(verifiedClaims)
    } catch (error) {
      console.log(`Token verification failed with error ${error}.`);
    }

    const allWallets = await privy.walletApi.getWallet({ id: walletId });
    const publicKey = allWallets.publicKey!
   
    const address = publicKeyToAddress(publicKey, 'testnet');
    console.log('Expected address:', address);

    

    // Debug: Let's check what wallet we're actually using
    console.log('Wallet ID being used:', walletId);
    console.log('Public key from wallet:', publicKey);
    console.log('Formatted public key:', walletAddress);
    
    // Verify the wallet actually owns this public key
    console.log('Full wallet data:', JSON.stringify(allWallets, null, 2));

    const transaction = await makeUnsignedSTXTokenTransfer({
      recipient: 'ST2J9WNZV97AJ49ZDR77WGNR3HDHQRSEHZ45JXB21',
      amount: 10000, // microSTX (0.01 STX)
      publicKey: publicKey, // ✅ Use the formatted version
      network: 'testnet',
      fee: 34640
    });

     // The `signer` contains the `sigHash` property needed for the `preSignSigHash`
    const signer = new TransactionSigner(transaction);

    console.log('=== TRANSACTION SIGNING DEBUG ===');
    console.log('- Transaction auth type:', transaction.auth.authType);
    console.log('- Transaction fee:', transaction.auth.spendingCondition.fee.toString());
    console.log('- Transaction nonce:', transaction.auth.spendingCondition.nonce.toString());
    console.log('- Public key used in transaction:', publicKey);
    console.log('- Signer sigHash (raw):', Buffer.from(signer.sigHash).toString('hex'));

    let preSignSigHash = sigHashPreSign(
      signer.sigHash,
      transaction.auth.authType,
      transaction.auth.spendingCondition.fee,
      transaction.auth.spendingCondition.nonce,
    );
  
    console.log('- PreSign SigHash:', preSignSigHash);
    
    const payload = `0x${preSignSigHash}`;
    console.log('- Payload to sign:', payload);
    console.log('=== END TRANSACTION DEBUG ===');
    console.log('About to format signature...');
    console.log('Starting systematic recovery ID testing...');

    const rawSignData = await signRaw(walletId, payload);
    console.log('Raw sign response:', rawSignData);
    const signature = rawSignData.data.signature;

    // Use the reusable recovery testing utility
    const result = await broadcastWithRecoveryTesting(
      signature,
      async (recoveryId: string) => {
        const testTransaction = await makeUnsignedSTXTokenTransfer({
          recipient: 'ST2J9WNZV97AJ49ZDR77WGNR3HDHQRSEHZ45JXB21',
          amount: 10000,
          publicKey: publicKey,
          network: 'testnet',
          fee: 34640
        });
        (testTransaction.auth.spendingCondition as SingleSigSpendingCondition).signature = createMessageSignature(recoveryId);
        return testTransaction;
      },
      async (transaction: any) => {
        return await broadcastTransaction({transaction: transaction, network: 'testnet' });
      },
      'STX-TRANSFER'
    );

    const response = result.response;
    const signatureData = result.signatureData;
    
    // Extract txid from response
    const txid = response.txid || response;


    // console.log('Raw sign successful:', signData);

    const transactionInfo = {
      type: 'STX Transfer',
      network: 'testnet',
      amount: '0.01 STX',
      recipient: 'ST2J9WNZV97AJ49ZDR77WGNR3HDHQRSEHZ45JXB21',
      memo: 'Privy demo transfer via HTTP API',
    };

    // Return txid in the expected format
    return NextResponse.json({
      txid: txid,
      success: result.success,
      signature: rawSignData.data.signature,
      decodedSignature: {
        r: signatureData.r,
        s: signatureData.s,
        v: signatureData.v,
        formatted: signatureData.formatted
      },
      hash: payload,
      walletId: walletId,
      transactionInfo,
      broadcastResult: response,
      authenticationData: rawSignData,
      signatureData: rawSignData.data.signature,
      note: result.success ? 
        `STX transfer signed successfully with recovery ID ${signatureData.v}` : 
        'STX transfer failed after trying all recovery IDs',
      recoveryIdUsed: signatureData.v,
      allVariantsTested: result.allVariantsTested
    });

  } catch (error) {
    console.error('Sign raw API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



