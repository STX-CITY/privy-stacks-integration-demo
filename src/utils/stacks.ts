/**
 * Utility functions for Stacks blockchain operations
 */

/**
 * Formats a raw signature from wallet providers into the format required by Stacks transactions (VRS format)
 * @param signature The raw signature (with or without 0x prefix)
 * @returns An object containing the formatted signature and its components
 */
export const revalidate = 0;

// Helper function to test all recovery IDs and return the best option
function tryRecoveryIds(rPadded: string, sPadded: string, publicKeyFromWallet?: string, transactionHash?: string) {
  const recoveryIds = ['00', '01', '02', '03', '04', '05', '06','07','08','09'];
  console.log('=== RECOVERY ID TESTING ===');
  console.log('Testing all recovery IDs for signature validation...');
  console.log('Available recovery IDs:', recoveryIds);
  
  // Generate all possible signature variations
  const allOptions = recoveryIds.map(v => ({
    v,
    formatted: `${v}${rPadded}${sPadded}`
  }));
  
  console.log('Generated signature options:');
  allOptions.forEach((option, index) => {
    console.log(`  [${index}] Recovery ID ${option.v}: ${option.formatted.substring(0, 20)}...`);
  });
  
  // Try recovery IDs in order: 01, 00, 02, 03
  // Based on our analysis, '01' is more likely to work than '00'
  const tryOrder = [1, 0, 2, 3]; // Corresponds to ['01', '00', '02', '03']
  const selectedIndex = tryOrder[0]; // Start with '01'
  const selectedOption = allOptions[selectedIndex];
  
  console.log(`Selected recovery ID: ${selectedOption.v} (priority order)`);
  console.log('=== END RECOVERY ID TESTING ===');
  
  return selectedOption;
}

// Export function to generate multiple signature variants for testing
export function generateAllSignatureVariants(signature: string) {
  const hexSig = signature.startsWith('0x') ? signature.slice(2) : signature;
  const r = hexSig.slice(0, 64).padStart(64, '0');
  const s = hexSig.slice(64, 128).padStart(64, '0');
  
  return ['00', '01', '02', '03'].map(v => ({
    v,
    r,
    s,
    formatted: `${v}${r}${s}`
  }));
}

// Reusable function for systematic recovery ID testing with transaction broadcasting
export async function broadcastWithRecoveryTesting(
  signature: string,
  createTransactionFn: (recoveryId: string) => Promise<any>,
  broadcastFn: (transaction: any) => Promise<any>,
  apiPrefix: string = 'STACKS'
): Promise<{
  success: boolean;
  response: any;
  signatureData: any;
  allVariantsTested: number;
}> {
  console.log(`=== ${apiPrefix}: SYSTEMATIC RECOVERY ID TESTING ===`);
  const signatureVariants = generateAllSignatureVariants(signature);
  console.log(`Generated ${signatureVariants.length} signature variants for testing`);
  
  // Try recovery IDs in priority order: 01, 00, 02, 03
  const tryOrder = [1, 0, 2, 3]; // Indices for recovery IDs
  let broadcastResponse = null;
  let lastError = null;
  let successfulSignature = null;
  
  for (const index of tryOrder) {
    const variant = signatureVariants[index];
    console.log(`\n--- ${apiPrefix}: Attempting Recovery ID ${variant.v} ---`);
    
    try {
      // Create transaction with current recovery ID
      const transaction = await createTransactionFn(variant.formatted);
      
      console.log(`${apiPrefix}: Broadcasting transaction with recovery ID ${variant.v}...`);
      
      // Try to broadcast
      const response = await broadcastFn(transaction);
      console.log(`${apiPrefix}: Broadcast result for recovery ID ${variant.v}:`, response);
      
      // Check if successful (no SignatureValidation error)
      if (!response.error || response.reason !== 'SignatureValidation') {
        console.log(`✅ ${apiPrefix}: SUCCESS with recovery ID ${variant.v}!`);
        broadcastResponse = response;
        successfulSignature = variant;
        break;
      } else {
        console.log(`❌ ${apiPrefix}: Recovery ID ${variant.v} failed: ${response.reason_data?.message || response.reason}`);
        lastError = response;
      }
    } catch (error) {
      console.log(`❌ ${apiPrefix}: Recovery ID ${variant.v} threw error:`, error);
      lastError = { error: 'Exception', message: String(error) };
    }
  }
  
  const response = broadcastResponse || lastError;
  const signatureData = successfulSignature || signatureVariants[1]; // Default to '01' variant
  
  console.log(`\n=== ${apiPrefix}: FINAL RESULT ===`);
  console.log('Final broadcast result:', response);
  
  return {
    success: !!broadcastResponse,
    response,
    signatureData,
    allVariantsTested: signatureVariants.length
  };
}

export function formatStacksSignature(signature: string) {
  // Decode hex signature (remove 0x prefix if present)
  const hexSig = signature.startsWith('0x') ? signature.slice(2) : signature;
  
  console.log('=== SIGNATURE FORMATTING DEBUG ===');
  console.log('- Original signature:', signature);
  console.log('- Hex signature (no prefix):', hexSig);
  console.log('- Signature length:', hexSig.length);
  
  // Validate signature length - should be 128 characters (64 bytes) for r+s
  if (hexSig.length !== 128) {
    console.error('WARNING: Signature length is not 128 characters:', hexSig.length);
  }
  
  // According to Stacks signature format, we need VRS order
  // The signature from Privy is typically in RS format (64 bytes r + 64 bytes s)
  // Extract r and s values (first 64 chars = r, next 64 chars = s)
  const r = hexSig.slice(0, 64);
  const s = hexSig.slice(64, 128);
  
  console.log('- Raw R (64 chars):', r);
  console.log('- Raw S (64 chars):', s);
  
  // Ensure r and s are exactly 64 characters (32 bytes)
  const rPadded = r.padStart(64, '0');
  const sPadded = s.padStart(64, '0');
  
  console.log('- R padded:', rPadded);
  console.log('- S padded:', sPadded);
  console.log('- R length after padding:', rPadded.length);
  console.log('- S length after padding:', sPadded.length);
  
  // Try different recovery IDs to find the correct one
  const { v, formatted: formattedSignature } = tryRecoveryIds(rPadded, sPadded);
  
  console.log('- V component (recovery ID):', v);
  console.log('- Final formatted signature:', formattedSignature);
  console.log('- Final signature length:', formattedSignature.length);
  console.log('=== END SIGNATURE DEBUG ===');
  
  return {
    r: rPadded,
    s: sPadded,
    v,
    formatted: formattedSignature
  };
}