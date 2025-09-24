import { NextRequest, NextResponse } from 'next/server';
import {
  AnchorMode,
  broadcastTransaction,
  Cl,
  ClarityVersion,
  createMessageSignature,
  makeUnsignedContractCall,
  makeUnsignedContractDeploy,
  makeUnsignedSTXTokenTransfer,
  Pc,
  PostConditionMode,
  publicKeyToAddress,
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
import { formatStacksSignature, broadcastWithRecoveryTesting } from '@/utils/stacks';
import { Braah_One } from 'next/font/google';
import {PublicKey} from '@stacks/common'

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

    const currentWallet = 'SPJ7N2FGH300NS65SHDBMWR42RAZGK3NN127DJVS'
    const amountInMicroSTX = 100000
    const tokenSell = 2279877495
    const tokenContract = 'SP11Z0M9SXMXM2BGQHDPT0B9Z03TDE56WFSF6EEX8.gm-stxcity'
    // Add post conditions - for buying, we send STX and expect to receive tokens
    
    
    const dexSendSTXPC = Pc.principal('SP11Z0M9SXMXM2BGQHDPT0B9Z03TDE56WFSF6EEX8.gm-stxcity-dex')
    .willSendGte(BigInt(100))
    .ustx();
  
  const sendTokenToDexPC = Pc.principal(currentWallet)
    .willSendLte(BigInt(tokenSell))
    .ft(tokenContract, 'GM');

  
    const contractBody = `;;  ---------------------------------------------------------
;; SIP-10 Fungible Token Contract | Created on: stx.city/deploy
;; ---------------------------------------------------------

;; Errors 
(define-constant ERR-UNAUTHORIZED u401)
(define-constant ERR-NOT-OWNER u402)
(define-constant ERR-INVALID-PARAMETERS u403)
(define-constant ERR-NOT-ENOUGH-FUND u101)

(impl-trait 'ST339A455EK9PAY9NP81WHK73T1JMFC3NN0321T18.sip-010-trait-ft-standard.sip-010-trait)

;; Constants
(define-constant MAXSUPPLY u1000000000)

;; Variables
(define-fungible-token Audit MAXSUPPLY)
(define-data-var contract-owner principal tx-sender) 



;; SIP-10 Functions
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq from tx-sender)
            (err ERR-UNAUTHORIZED))
        ;; Perform the token transfer
        (ft-transfer? Audit amount from to)
    )
)


;; DEFINE METADATA
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://pdakhjpwkuwtadzmpnjm.supabase.co/storage/v1/object/public/uri/NhpEHsZe-audit-0-decimals.json"))

(define-public (set-token-uri (value (string-utf8 256)))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-UNAUTHORIZED))
        (var-set token-uri (some value))
        (ok (print {
              notification: "token-metadata-update",
              payload: {
                contract-id: (as-contract tx-sender),
                token-class: "ft"
              }
            })
        )
    )
)


(define-read-only (get-balance (owner principal))
  (ok (ft-get-balance Audit owner))
)
(define-read-only (get-name)
  (ok "Audit")
)

(define-read-only (get-symbol)
  (ok "Audit")
)

(define-read-only (get-decimals)
  (ok u0)
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply Audit))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; transfer ownership
(define-public (transfer-ownership (new-owner principal))
  (begin
    ;; Checks if the sender is the current owner
    (if (is-eq tx-sender (var-get contract-owner))
      (begin
        ;; Sets the new owner
        (var-set contract-owner new-owner)
        ;; Returns success message
        (ok "Ownership transferred successfully"))
      ;; Error if the sender is not the owner
      (err ERR-NOT-OWNER)))
)


;; ---------------------------------------------------------
;; Utility Functions
;; ---------------------------------------------------------
(define-public (send-many (recipients (list 200 { to: principal, amount: uint, memo: (optional (buff 34)) })))
  (fold check-err (map send-token recipients) (ok true))
)

(define-private (check-err (result (response bool uint)) (prior (response bool uint)))
  (match prior ok-value result err-value (err err-value))
)

(define-private (send-token (recipient { to: principal, amount: uint, memo: (optional (buff 34)) }))
  (send-token-with-memo (get amount recipient) (get to recipient) (get memo recipient))
)

(define-private (send-token-with-memo (amount uint) (to principal) (memo (optional (buff 34))))
  (let ((transferOk (try! (transfer amount tx-sender to memo))))
    (ok transferOk)
  )
)

(define-private (send-stx (recipient principal) (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender recipient))
    (ok true) 
  )
)
  (begin
 
    (try! (ft-mint? Audit u10000000 (var-get contract-owner)))

 
)
`

    // Generate a random contract name
    const randomContract = `demo-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Get address for nonce fetching
    const address = publicKeyToAddress(publicKey, 'testnet');



    // Define reusable transaction options
    const txOptions = {
      publicKey: publicKey,
      clarityVersion: ClarityVersion.Clarity2,
      contractName: randomContract,
      codeBody: contractBody,
      fee: 34640,
      network: 'testnet' as const
    };

    const transaction = await makeUnsignedContractDeploy(txOptions)

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
        const testTransaction = await makeUnsignedContractDeploy(txOptions);
        (testTransaction.auth.spendingCondition as SingleSigSpendingCondition).signature = createMessageSignature(recoveryId);
        return testTransaction;
      },
      async (transaction: any) => {
        return await broadcastTransaction({transaction: transaction, network: 'testnet' });
      },
      'DEPLOY-CONTRACT'
    );

    const response = result.response;
    const signatureData = result.signatureData;
    console.log('Deploy contract broadcast result:', response);
    
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
      type: 'Contract Deployment',
      network: 'testnet',
      contract: randomContract,
      contractType: 'Audit Token SIP-10 Contract',
      memo: 'Deploying Audit token contract via Privy',
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
        `Contract deployment signed successfully with recovery ID ${signatureData.v}` : 
        'Contract deployment failed after trying all recovery IDs',
      recoveryIdUsed: signatureData.v,
      allVariantsTested: result.allVariantsTested
    });

  } catch (error) {
    console.error('Deploy contract API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



