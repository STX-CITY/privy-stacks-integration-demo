import { CipherSuite, DhkemP256HkdfSha256, HkdfSha256 } from "@hpke/core";
import { Chacha20Poly1305 } from "@hpke/chacha20poly1305";
import {
  formatRequestForAuthorizationSignature,
  generateAuthorizationSignature,
} from "@privy-io/server-auth/wallet-api";
import { tryAsync } from "try.rs";
import type { WalletApiRequestSignatureInput } from "@privy-io/server-auth";
import {v4 as uuidv4} from 'uuid';
export const revalidate = 0;
function generateBasicAuthHeader(username: string, password: string): string {
  const token = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${token}`;
}

async function decryptHPKEMessage(
  privateKeyBase64: string,
  encapsulatedKeyBase64: string,
  ciphertextBase64: string
): Promise<string> {
  // Initialize the cipher suite
  const suite = new CipherSuite({
    kem: new DhkemP256HkdfSha256(),
    kdf: new HkdfSha256(),
    aead: new Chacha20Poly1305(),
  });

  // Convert base64 to ArrayBuffer using browser APIs
  const base64ToBuffer = (base64: string) =>
    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;

  // Import private key using WebCrypto
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    base64ToBuffer(privateKeyBase64),
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );

  // Create recipient context and decrypt
  const recipient = await suite.createRecipientContext({
    recipientKey: privateKey,
    enc: base64ToBuffer(encapsulatedKeyBase64),
  });

  return new TextDecoder().decode(
    await recipient.open(base64ToBuffer(ciphertextBase64))
  );
}

// TODO: Should check if a wallet has an additional signer, not owner
export async function checkIfWalletHasOwner(walletId: string) {
  try {
    const res = await fetch(`https://api.privy.io/v1/wallets/${walletId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "privy-app-id": process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
        Authorization: generateBasicAuthHeader(
          process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
          process.env.PRIVY_APP_SECRET as string
        ),
      },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch wallet owner: ${JSON.stringify(await res.json())}`
      );
    }

    const data = (await res.json()) as { owner_id: string };
    return !!data.owner_id;
  } catch (e) {
    throw new Error(
      `Checking wallet owner failed: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }
}

export async function setWalletOwner(walletId: string, ownerId: string) {
  try {
    const res = await fetch(`https://api.privy.io/v1/wallets/${walletId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "privy-app-id": process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
        Authorization: generateBasicAuthHeader(
          process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
          process.env.PRIVY_APP_SECRET as string
        ),
      },
      body: JSON.stringify({
        owner_id: ownerId,
      }),
    });

    if (!res.ok) {
      throw new Error(
        `Failed to set wallet owner: ${JSON.stringify(await res.json())}`
      );
    }

    return true;
  } catch (e) {
    throw new Error(
      `Setting wallet owner failed: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }
}

export async function signRaw(walletId: string, hash: string) {
    try {
      const doesWalletHaveOwner = await checkIfWalletHasOwner(walletId);
  
      if (!doesWalletHaveOwner) {
        await setWalletOwner(
          walletId,
          process.env.PRIVY_WALLET_OWNER_ID as string
        );
      }

      // Generate a unique idempotency key
      const idempotencyKey = uuidv4();


      const input: WalletApiRequestSignatureInput = {
        headers: {
          "privy-app-id": process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
          "privy-idempotency-key": idempotencyKey
        },
        method: "POST",
        url: `https://api.privy.io/v1/wallets/${walletId}/raw_sign`,
        version: 1,
        body: {
          params: {
            hash
          }
        },
      };
      const signature = generateAuthorizationSignature({
        input: input,
        authorizationPrivateKey: process.env.QUORUMS_PRIVATE_KEY as string,
      });
  
      if (!signature) {
        throw new Error("Failed to generate authorization signature");
      }
  
      const res = await fetch(
        `https://api.privy.io/v1/wallets/${walletId}/raw_sign`,
        {
          method: input.method,
          headers: {
            ...input.headers,
            "Content-Type": "application/json",
            "privy-authorization-signature": signature as string,
            Authorization: generateBasicAuthHeader(
              process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
              process.env.PRIVY_APP_SECRET as string
            ),
          },
          body: JSON.stringify(input.body),
        }
      );
  
      if (!res.ok) {
        throw new Error(
          `Failed to fetch exported keys: ${JSON.stringify(await res.json())}`
        );
      }
  
    const retunTx = await res.json();
    console.log('sign data: ', retunTx);
  
      return retunTx;
    } catch (e) {
      throw new Error(
        `Exporting Privy wallet failed: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }


  export async function exportPrivyWallet(walletId: string, publicKey: string) {
  try {
    const doesWalletHaveOwner = await checkIfWalletHasOwner(walletId);

    if (!doesWalletHaveOwner) {
      await setWalletOwner( 
        walletId,
        process.env.PRIVY_WALLET_OWNER_ID as string
      );
    }
    const base64PublicKey = Buffer.from(publicKey).toString("base64");

    const input: WalletApiRequestSignatureInput = {
      headers: {
        "privy-app-id": process.env.PRIVY_APP_ID as string,
      },
      method: "POST",
      url: `https://api.privy.io/v1/wallets/${walletId}/export`,
      version: 1,
      body: {
        encryption_type: "HPKE",
        recipient_public_key: base64PublicKey,
      },
    };
    
    const signature = generateAuthorizationSignature({
        input: input,
        authorizationPrivateKey: process.env.QUORUMS_PRIVATE_KEY as string,
      });

    if (!signature) {
      throw new Error("Failed to generate authorization signature");
    }

    const res = await fetch(
      `https://api.privy.io/v1/wallets/${walletId}/export`,
      {
        method: input.method,
        headers: {
          ...input.headers,
          "Content-Type": "application/json",
          "privy-authorization-signature": signature as string,
          Authorization: generateBasicAuthHeader(
            process.env.PRIVY_APP_ID as string,
            process.env.PRIVY_APP_SECRET as string
          ),
        },
        body: JSON.stringify(input.body),
      }
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch exported keys: ${JSON.stringify(await res.json())}`
      );
    }

    const data = (await res.json()) as {
      encryption_type: string;
      ciphertext: string;
      encapsulated_key: string;
    };


    const keypair = await tryAsync(() =>
      crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-256",
        },
        true,
        ["deriveKey", "deriveBits"]
      )
    );
    if (keypair.error) {
      throw new Error(
        `Failed to generate key pair: ${keypair.error.message}`
      );
    }
    
    const privateKey = await crypto.subtle.exportKey(
      "pkcs8",
      keypair.value.privateKey
    );
    const base64PrivateKey = Buffer.from(privateKey).toString("base64");

    const decryptedMessage = await decryptHPKEMessage(
      base64PrivateKey,
      data.encapsulated_key,
      data.ciphertext
    );

    return decryptedMessage;
  } catch (e) {
    throw new Error(
      `Exporting Privy wallet failed: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }
}