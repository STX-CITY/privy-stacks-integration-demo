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
import { formatStacksSignature, generateAllSignatureVariants, broadcastWithRecoveryTesting } from '@/utils/stacks';
import { Braah_One } from 'next/font/google';

export const revalidate = 0;
export async function POST(request: NextRequest) {
  try {
    const { walletId } = await request.json();
    const accessToken = (await headers()).get('Authorization')?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }





    // Get the shared Privy client instance
    const privy = getPrivyServerClient();



    let verifiedClaims: any;
    try {
      verifiedClaims = await privy.verifyAuthToken(accessToken);
      console.log('Verified claims:', verifiedClaims);
    } catch (error) {
      console.log(`Token verification failed with error ${error}.`);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const allWallets = await privy.walletApi.getWallet({ id: walletId });
    const publicKey = allWallets.publicKey!
    // Add 0x prefix to publicKey if not present
    const formattedPublicKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;

    const currentWallet = 'SPJ7N2FGH300NS65SHDBMWR42RAZGK3NN127DJVS'
    const amountInMicroSTX = 100000
    const tokenSell = 2279877495
    const tokenContract = 'SP11Z0M9SXMXM2BGQHDPT0B9Z03TDE56WFSF6EEX8.gm-stxcity'

    // Define reusable transaction options
    const txOptions = {
      contractAddress: 'SP11Z0M9SXMXM2BGQHDPT0B9Z03TDE56WFSF6EEX8',
      contractName: 'gm-stxcity-dex',
      functionName: 'sell',
      functionArgs: [
        Cl.address(tokenContract),
        Cl.uint(BigInt(tokenSell)), // Amount of tokenSell
      ],
      publicKey: publicKey,
      network: 'mainnet' as const,
      postConditionMode: PostConditionMode.Allow,
      fee: 14640, // Increased fee for mainnet
    };

    const transaction = await makeUnsignedContractCall(txOptions)

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
    console.log('Raw sign response:', rawSignData);
    const signature = rawSignData.data.signature;

    // Use the reusable recovery testing utility
    const result = await broadcastWithRecoveryTesting(
      signature,
      async (recoveryId: string) => {
        const testTransaction = await makeUnsignedContractCall(txOptions);
        (testTransaction.auth.spendingCondition as SingleSigSpendingCondition).signature = createMessageSignature(recoveryId);
        return testTransaction;
      },
      async (transaction: any) => {
        return await broadcastTransaction({ transaction: transaction });
      },
      'SELL-MEME'
    );

    const response = result.response;
    const signatureData = result.signatureData;

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
      type: 'Sell Meme Token',
      network: 'mainnet',
      amount: '0.1 STX received',
      token: 'GM STXCITY',
      contractAddress: 'SP11Z0M9SXMXM2BGQHDPT0B9Z03TDE56WFSF6EEX8.gm-stxcity-dex',
      memo: 'Selling GM STXCITY meme token via Privy',
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
        `Sell meme signed successfully with recovery ID ${signatureData.v}` :
        'Sell meme failed after trying all recovery IDs',
      recoveryIdUsed: signatureData.v,
      allVariantsTested: result.allVariantsTested
    });

  } catch (error) {
    console.error('Sell meme API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



