import { PrivyClient } from '@privy-io/server-auth';

let privyClientInstance: PrivyClient | null = null;

/**
 * Get a configured Privy server client instance
 * This function creates a singleton instance to avoid recreating the client multiple times
 */
export function getPrivyServerClient(): PrivyClient {
  if (privyClientInstance) {
    return privyClientInstance;
  }

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const privyAppSecret = process.env.PRIVY_APP_SECRET;
  const APP_PRIVATE_SIGN = process.env.QUORUMS_PRIVATE_KEY

  if (!privyAppId || !privyAppSecret) {
    throw new Error('Missing Privy configuration: PRIVY_APP_ID and PRIVY_APP_SECRET must be set');
  }

  privyClientInstance = new PrivyClient(privyAppId, privyAppSecret, {
    walletApi: {
      authorizationPrivateKey: APP_PRIVATE_SIGN
    }
  });

  return privyClientInstance;
}