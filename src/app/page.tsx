'use client';

import { usePrivy, useSessionSigners, useAuthorizationSignature } from '@privy-io/react-auth';
import {useCreateWallet} from '@privy-io/react-auth/extended-chains'
import { getAddressFromPublicKey } from '@stacks/transactions';
import {useState, useEffect} from 'react';

export default function Home() {
  const {ready, authenticated, user, login, logout, exportWallet, getAccessToken} = usePrivy();
  const {createWallet} = useCreateWallet();
  const {addSessionSigners} = useSessionSigners();
  const {generateAuthorizationSignature} = useAuthorizationSignature();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletCreationError, setWalletCreationError] = useState<string | null>(null);
  const [stacksAddresses, setStacksAddresses] = useState<{testnet: string, mainnet: string} | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isExportingKey, setIsExportingKey] = useState(false);
  const [exportKeyError, setExportKeyError] = useState<string | null>(null);
  const [exportedKeyData, setExportedKeyData] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isGettingWallet, setIsGettingWallet] = useState(false);
  const [getWalletError, setGetWalletError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [isSigningRaw, setIsSigningRaw] = useState(false);
  const [rawSignError, setRawSignError] = useState<string | null>(null);
  const [rawSignature, setRawSignature] = useState<any>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [authorizationKey, setAuthorizationKey] = useState<string | null>(null);
  const [walletPublicKeys, setWalletPublicKeys] = useState<Record<string, string>>({});
  const [addingSignerWalletAddress, setAddingSignerWalletAddress] = useState<string | null>(null);
  const [signingWalletId, setSigningWalletId] = useState<string | null>(null);
  const [signingHttpWalletId, setSigningHttpWalletId] = useState<string | null>(null);
  const [authorizationSignature, setAuthorizationSignature] = useState<string | null>(null);
  const [isGeneratingSignature, setIsGeneratingSignature] = useState(false);
  const [decodedKey, setDecodedKey] = useState<string | null>(null);
  const [isDecodingKey, setIsDecodingKey] = useState(false);
  const [walletFullData, setWalletFullData] = useState<Record<string, any>>({});
  const [isCreatingClientWallet, setIsCreatingClientWallet] = useState(false);
  const [isCreatingServerWallet, setIsCreatingServerWallet] = useState(false);
  const [serverWalletCreationError, setServerWalletCreationError] = useState<string | null>(null);
  const [walletCreationSuccess, setWalletCreationSuccess] = useState<string | null>(null);
  const [isBuyingMeme, setIsBuyingMeme] = useState(false);
  const [buyMemeResult, setBuyMemeResult] = useState<any>(null);
  const [buyMemeError, setBuyMemeError] = useState<string | null>(null);
  const [buyingMemeWalletId, setBuyingMemeWalletId] = useState<string | null>(null);
  const [isSellingMeme, setIsSellingMeme] = useState(false);
  const [sellMemeResult, setSellMemeResult] = useState<any>(null);
  const [sellMemeError, setSellMemeError] = useState<string | null>(null);
  const [sellingMemeWalletId, setSellingMemeWalletId] = useState<string | null>(null);
  const [isDeployingContract, setIsDeployingContract] = useState(false);
  const [deployContractResult, setDeployContractResult] = useState<any>(null);
  const [deployContractError, setDeployContractError] = useState<string | null>(null);
  const [deployingContractWalletId, setDeployingContractWalletId] = useState<string | null>(null);

  



  // Function to add session signers to the wallet
  const addSessionSignerToWallet = async (walletAddress: string) => {
    try {
      console.log('Adding session signer to wallet:', walletAddress);
      setAddingSignerWalletAddress(walletAddress);
      
      debugger;
      // Generate authorization signature after adding session signer
      await addSessionSigners({
        address: walletAddress,
        signers: [{
          signerId: 'vha12ttiednmgekw7wzk7c9s', // quorum id
        }]
      });
      
      console.log('Session signer added successfully');

    } catch (error) {
      console.error('Error adding session signer:', error);
    } finally {
      setAddingSignerWalletAddress(null);
    }
  };

  // Function to fetch wallet public key from API
  const fetchWalletPublicKey = async (walletId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/get-wallet?walletId=${walletId}`);
      const result = await response.json();
      
      if (response.ok && result.data) {
        // Store the full wallet data
        setWalletFullData(prev => ({
          ...prev,
          [walletId]: result.data
        }));
        
        return result.data.publicKey || null;
      } else {
        console.error('Failed to fetch wallet public key:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching wallet public key:', error);
      return null;
    }
  };

  // Function to load public keys for all wallets
  const loadWalletPublicKeys = async () => {
    if (!user?.linkedAccounts) return;
    
    const wallets = user.linkedAccounts.filter((account: any) => account.type === 'wallet');
    const publicKeys: Record<string, string> = {};
    
    for (const wallet of wallets) {
      const walletAccount = wallet as any; // Type assertion for wallet properties
      if (walletAccount.id) {
        const publicKey = await fetchWalletPublicKey(walletAccount.id);
        if (publicKey) {
          publicKeys[walletAccount.id] = publicKey;
        }
      }
    }
    
    setWalletPublicKeys(publicKeys);
  };

  // Function to create client-side wallet
  const handleCreateClientWallet = async () => {
    try {
      setIsCreatingClientWallet(true);
      setWalletCreationError(null);
      setWalletCreationSuccess(null);

      debugger;
      const wallet = await createWallet({chainType: 'bitcoin-segwit'});
      console.log('Client-side wallet created:', wallet);
      
      setWalletCreationSuccess('Client-side wallet created successfully!');
      
      // Reload wallet public keys to include the new wallet
      setTimeout(() => {
        loadWalletPublicKeys();
      }, 1000);

    } catch (error) {
      console.error('Error creating client-side wallet:', error);
      setWalletCreationError(error instanceof Error ? error.message : 'Failed to create client-side wallet');
    } finally {
      setIsCreatingClientWallet(false);
    }
  };

  // Function to create server-side wallet
  const handleCreateServerWallet = async () => {
    try {
      setIsCreatingServerWallet(true);
      setServerWalletCreationError(null);
      setWalletCreationSuccess(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const accessToken = await getAccessToken();
      const response = await fetch('/api/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: user.id,
          chainType: 'bitcoin-segwit'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create server-side wallet');
      }
      console.log('Server-side wallet created:', result.wallet);
      setWalletCreationSuccess('Server-side wallet created successfully!');
      // Reload wallet public keys to include the new wallet
      setTimeout(() => {
        loadWalletPublicKeys();
      }, 1000);
    } catch (error) {
      console.error('Error creating server-side wallet:', error);
      setServerWalletCreationError(error instanceof Error ? error.message : 'Failed to create server-side wallet');
    } finally {
      setIsCreatingServerWallet(false);
    }
  };

  // Function to export wallet client-side
  const handleExportWalletClientSide = async (wallet: any) => {
    try {
      console.log('Exporting wallet client-side for account:', wallet);
      
      // Check if this is a Privy embedded wallet
      if (wallet.walletClientType !== 'privy') {
        console.error('Can only export Privy embedded wallets');
        setExportKeyError('Can only export Privy embedded wallets');
        return;
      }

      if (!authenticated) {
        console.error('User not authenticated');
        setExportKeyError('User not authenticated');
        return;
      }

      setIsExportingKey(true);
      setExportKeyError(null);
      setExportedKeyData(null);

      // Use the exportWallet function from usePrivy hook
      if (exportWallet) {
        const exportedData = await exportWallet();
        setExportedKeyData(exportedData);
        console.log('Wallet exported successfully (client-side):', exportedData);
      } else {
        throw new Error('Export wallet function not available');
      }

    } catch (error) {
      console.error('Error exporting wallet client-side:', error);
      setExportKeyError(error instanceof Error ? error.message : 'Failed to export wallet client-side');
    } finally {
      setIsExportingKey(false);
    }
  };

  // Function to export wallet server-side
  const handleExportWalletServerSide = async (wallet: any) => {
    try {
      debugger;
      console.log('Exporting wallet server-side for account:', wallet);
      
      // Check if this is a Privy embedded wallet
      if (wallet.walletClientType !== 'privy') {
        console.error('Can only export Privy embedded wallets');
        setExportKeyError('Can only export Privy embedded wallets');
        return;
      }

      if (!wallet.id) {
        console.error('Wallet ID not available');
        setExportKeyError('Wallet ID not available');
        return;
      }

      setIsExportingKey(true);
      setExportKeyError(null);
      setExportedKeyData(null);

      
      // Get the public key from the full wallet data
      const walletPublicKey = walletFullData[wallet.id]?.publicKey;

      // Call the server-side API
      const response = await fetch('/api/export-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId: wallet.id,
          publicKey: walletPublicKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to export wallet server-side');
      }

      setExportedKeyData(result.data);
      console.log('Wallet exported successfully (server-side):', result.data);

    } catch (error) {
      console.error('Error exporting wallet server-side:', error);
      setExportKeyError(error instanceof Error ? error.message : 'Failed to export wallet server-side');
    } finally {
      setIsExportingKey(false);
    }
  };

  // Function to sign raw transaction for a specific wallet
  const handleSignRawTXForWallet = async (wallet: any) => {
    try {
      console.log('Signing raw TX for wallet:', wallet);
      
      // Check if this is a Privy embedded wallet
      if (wallet.walletClientType !== 'privy') {
        console.error('Can only sign with Privy embedded wallets');
        setRawSignError('Can only sign with Privy embedded wallets');
        return;
      }

      if (!wallet.id) {
        console.error('Wallet ID not available');
        setRawSignError('Wallet ID not available');
        return;
      }

      setSigningWalletId(wallet.id);
      setRawSignError(null);
      setRawSignature(null);

      // Get the public key from the full wallet data
      const walletPublicKey = walletFullData[wallet.id]?.publicKey;

      const accessToken = await getAccessToken();

      // Call the API to sign the raw transaction
      const response = await fetch('/api/sign-raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletId: wallet.id,
          publicKey: walletPublicKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign raw transaction');
      }

      setRawSignature(result);
      console.log('Raw transaction signed successfully:', result);

    } catch (error) {
      console.error('Error signing raw transaction:', error);
      setRawSignError(error instanceof Error ? error.message : 'Failed to sign raw transaction');
    } finally {
      setSigningWalletId(null);
    }
  };

  // Function to generate authorization signature
  const handleGenerateSignature = async () => {
    try {
      setIsGeneratingSignature(true);
      console.log('Generating authorization signature...');
   
      const accessToken = await getAccessToken();
      console.log(accessToken);
      setAuthorizationKey(accessToken);
      
    } catch (error) {
      console.error('Error generating authorization signature:', error);
    } finally {
      setIsGeneratingSignature(false);
    }
  };

  
  // Function to buy meme token for a specific wallet
  const handleBuyMeme = async (wallet: any) => {
    try {
      console.log('Buying meme token for wallet:', wallet);
      
      // Check if this is a Privy embedded wallet
      if (wallet.walletClientType !== 'privy') {
        console.error('Can only buy with Privy embedded wallets');
        setBuyMemeError('Can only buy with Privy embedded wallets');
        return;
      }

      if (!wallet.id) {
        console.error('Wallet ID not available');
        setBuyMemeError('Wallet ID not available');
        return;
      }

      setBuyingMemeWalletId(wallet.id);
      setBuyMemeError(null);
      setBuyMemeResult(null);

      const accessToken = await getAccessToken();

      // Call the API to buy meme token
      const response = await fetch('/api/buy-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletId: wallet.id,
        }),
      });

      const result = await response.json();

      // Check if it's an error response (even if status is 400, we might have a txid)
      if (!response.ok || !result.success) {
        // Check if we have a txid even though it failed (transaction rejected)
        if (result.txid) {
          setBuyMemeResult({
            txid: result.txid,
            walletId: wallet.id,
            error: result.error,
            reason: result.reason,
            reason_data: result.reason_data,
            transactionInfo: result.transactionInfo
          });
          setBuyMemeError(`${result.error}: ${result.reason}`);
        } else {
          throw new Error(result.error || 'Failed to buy meme token');
        }
      } else {
        // Handle successful response with txid
        if (result.txid) {
          setBuyMemeResult({
            txid: result.txid,
            walletId: wallet.id,
            success: true,
            transactionInfo: result.transactionInfo
          });
          console.log('Meme token purchase broadcast successfully:', result.txid);
        } else {
          setBuyMemeResult(result);
        }
      }

    } catch (error) {
      console.error('Error buying meme token:', error);
      setBuyMemeError(error instanceof Error ? error.message : 'Failed to buy meme token');
    } finally {
      setBuyingMemeWalletId(null);
    }
  };

  // Function to sell meme token for a specific wallet
  const handleSellMeme = async (wallet: any) => {
    try {
      console.log('Selling meme token for wallet:', wallet);
      
      // Check if this is a Privy embedded wallet
      if (wallet.walletClientType !== 'privy') {
        console.error('Can only sell with Privy embedded wallets');
        setSellMemeError('Can only sell with Privy embedded wallets');
        return;
      }

      if (!wallet.id) {
        console.error('Wallet ID not available');
        setSellMemeError('Wallet ID not available');
        return;
      }

      setSellingMemeWalletId(wallet.id);
      setSellMemeError(null);
      setSellMemeResult(null);

      const accessToken = await getAccessToken();

      // Call the API to sell meme token
      const response = await fetch('/api/sell-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletId: wallet.id,
        }),
      });

      const result = await response.json();

      // Check if it's an error response (even if status is 400, we might have a txid)
      if (!response.ok || !result.success) {
        // Check if we have a txid even though it failed (transaction rejected)
        if (result.txid) {
          setSellMemeResult({
            txid: result.txid,
            walletId: wallet.id,
            error: result.error,
            reason: result.reason,
            reason_data: result.reason_data,
            transactionInfo: result.transactionInfo
          });
          setSellMemeError(`${result.error}: ${result.reason}`);
        } else {
          throw new Error(result.error || 'Failed to sell meme token');
        }
      } else {
        // Handle successful response with txid
        if (result.txid) {
          setSellMemeResult({
            txid: result.txid,
            walletId: wallet.id,
            success: true,
            transactionInfo: result.transactionInfo
          });
          console.log('Meme token sale broadcast successfully:', result.txid);
        } else {
          setSellMemeResult(result);
        }
      }

    } catch (error) {
      console.error('Error selling meme token:', error);
      setSellMemeError(error instanceof Error ? error.message : 'Failed to sell meme token');
    } finally {
      setSellingMemeWalletId(null);
    }
  };

  // Function to deploy contract for a specific wallet
  const handleDeployContract = async (wallet: any) => {
    try {
      console.log('Deploying contract for wallet:', wallet);
      
      // Check if this is a Privy embedded wallet
      if (wallet.walletClientType !== 'privy') {
        console.error('Can only deploy with Privy embedded wallets');
        setDeployContractError('Can only deploy with Privy embedded wallets');
        return;
      }

      if (!wallet.id) {
        console.error('Wallet ID not available');
        setDeployContractError('Wallet ID not available');
        return;
      }

      setDeployingContractWalletId(wallet.id);
      setDeployContractError(null);
      setDeployContractResult(null);

      const accessToken = await getAccessToken();

      // Call the API to deploy contract
      const response = await fetch('/api/deploy-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletId: wallet.id,
        }),
      });

      const result = await response.json();

      // Check if it's an error response (even if status is 400, we might have a txid)
      if (!response.ok || !result.success) {
        // Check if we have a txid even though it failed (transaction rejected)
        if (result.txid) {
          setDeployContractResult({
            txid: result.txid,
            walletId: wallet.id,
            error: result.error,
            reason: result.reason,
            reason_data: result.reason_data,
            transactionInfo: result.transactionInfo
          });
          setDeployContractError(`${result.error}: ${result.reason}`);
        } else {
          throw new Error(result.error || 'Failed to deploy contract');
        }
      } else {
        // Handle successful response with txid
        if (result.txid) {
          setDeployContractResult({
            txid: result.txid,
            walletId: wallet.id,
            success: true,
            transactionInfo: result.transactionInfo
          });
          console.log('Contract deployment broadcast successfully:', result.txid);
        } else {
          setDeployContractResult(result);
        }
      }

    } catch (error) {
      console.error('Error deploying contract:', error);
      setDeployContractError(error instanceof Error ? error.message : 'Failed to deploy contract');
    } finally {
      setDeployingContractWalletId(null);
    }
  };

  // Function to sign raw transaction using HTTP API for a specific wallet
  const handleTransferSTX = async (wallet: any) => {
    try {
      console.log('Signing raw TX via HTTP API for wallet:', wallet);
      
      // Check if this is a Privy embedded wallet
      if (wallet.walletClientType !== 'privy') {
        console.error('Can only sign with Privy embedded wallets');
        setTransferError('Can only sign with Privy embedded wallets');
        return;
      }

      if (!wallet.id) {
        console.error('Wallet ID not available');
        setTransferError('Wallet ID not available');
        return;
      }

      setSigningHttpWalletId(wallet.id);
      setTransferError(null);
      setTransferResult(null);

      const accessToken = await getAccessToken();

      // Call the HTTP API to sign the raw transaction
      const response = await fetch('/api/transfer-stx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletId: wallet.id,
          walletAddress: stacksAddresses?.testnet
        }),
      });

      const result = await response.json();

      // Check if it's an error response (even if status is 400, we might have a txid)
      if (!response.ok || !result.success) {
        // Check if we have a txid even though it failed (transaction rejected)
        if (result.txid) {
          setTransferResult({
            txid: result.txid,
            walletId: wallet.id,
            error: result.error,
            reason: result.reason,
            reason_data: result.reason_data
          });
          setTransferError(`${result.error}: ${result.reason}`);
        } else {
          throw new Error(result.error || 'Failed to sign raw transaction via HTTP API');
        }
      } else {
        // Handle successful response with txid
        if (result.txid) {
          setTransferResult({
            txid: result.txid,
            walletId: wallet.id,
            success: true
          });
          console.log('Transaction broadcast successfully:', result.txid);
        } else {
          setTransferResult(result);
        }
      }

    } catch (error) {
      console.error('Error signing raw transaction via HTTP API:', error);
      setTransferError(error instanceof Error ? error.message : 'Failed to sign raw transaction via HTTP API');
    } finally {
      setSigningHttpWalletId(null);
    }
  };

  // Load wallet data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {

      console.log(user)
      debugger;
      const savedWalletData = localStorage.getItem(`wallet-${user.id}`);
      if (savedWalletData) {
        try {
          const walletData = JSON.parse(savedWalletData);
          if (walletData.walletId) setWalletId(walletData.walletId);
          if (walletData.seedPhrase) setSeedPhrase(walletData.seedPhrase);
          if (walletData.stacksAddresses) setStacksAddresses(walletData.stacksAddresses);
          if (walletData.publicKey) setPublicKey(walletData.publicKey);
        } catch (error) {
          console.error('Error loading wallet data from localStorage:', error);
        }
      }

      // Load authorization signature
      const savedAuthSignature = localStorage.getItem(`authSignature-${user.id}`);
      if (savedAuthSignature) {
        setAuthorizationSignature(savedAuthSignature);
      }
    }
  }, [user?.id]);

  // Auto-add session signer when user has an embedded wallet
  useEffect(() => {
    if (authenticated && user?.linkedAccounts) {
      const embeddedWallet = user.linkedAccounts.find(
        (account: any) => 
          account.type === 'wallet' && 
          account.walletClientType === 'privy'
      );
      
      if (embeddedWallet && (embeddedWallet as any).address) {
        addSessionSignerToWallet((embeddedWallet as any).address);
      }
    }
  }, [authenticated, user?.linkedAccounts]);

  // Load wallet public keys when user changes
  useEffect(() => {
    if (authenticated && user?.linkedAccounts) {
      loadWalletPublicKeys();
    }
  }, [authenticated, user?.linkedAccounts]);

  // Save wallet data to localStorage
  const saveWalletToStorage = (data: {
    walletId?: string;
    seedPhrase?: string;
    stacksAddresses?: {testnet: string, mainnet: string};
    publicKey?: string;
  }) => {
    if (typeof window !== 'undefined' && user?.id) {
      try {
        const existingData = localStorage.getItem(`wallet-${user.id}`);
        const currentData = existingData ? JSON.parse(existingData) : {};
        const updatedData = { ...currentData, ...data };
        localStorage.setItem(`wallet-${user.id}`, JSON.stringify(updatedData));
      } catch (error) {
        console.error('Error saving wallet data to localStorage:', error);
      }
    }
  };



  // Generate a proper HPKE public key for demonstration
  const generateRecipientPublicKey = async () => {
    try {
      // Generate an ECDH P-256 key pair (commonly used for HPKE)
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-256"
        },
        true, // extractable
        ["deriveKey", "deriveBits"]
      );

      // Export the public key in DER format
      const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      
      // Convert to base64 for transmission
      return Buffer.from(publicKeyBuffer).toString('base64');
    } catch (error) {
      console.error('Error generating HPKE public key:', error);
      // Fallback to a random key if crypto operations fail
      const fallbackKey = new Uint8Array(32);
      crypto.getRandomValues(fallbackKey);
      return Buffer.from(fallbackKey).toString('base64');
    }
  };

  // Check if user has an embedded wallet
  const hasEmbeddedWallet = user?.linkedAccounts?.find(
    (account: any) =>
      account.type === 'wallet' &&
      account.walletClientType === 'privy'
  );


  // Clear wallet data from localStorage (optional - for privacy)
  const clearWalletStorage = () => {
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.removeItem(`wallet-${user.id}`);
      // Reset local state
      setWalletId(null);
      setSeedPhrase(null);
      setStacksAddresses(null);
      setPublicKey(null);
      setShowSeedPhrase(false);
      setExportedKeyData(null);
      setExportKeyError(null);
      setWalletData(null);
      setGetWalletError(null);
      setRawSignature(null);
      setRawSignError(null);
      setBroadcastResult(null);
      setBroadcastError(null);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privy Bitcoin Demo</h1>
            <p className="text-gray-600">Email authentication with Bitcoin wallet creation</p>
          </div>

          {!authenticated ? (
            <div className="text-center">
              <button
                onClick={login}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Login with Email
              </button>
              <p className="text-sm text-gray-500 mt-4">
                You'll receive an OTP code via email to authenticate
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-800 mb-2">✓ Authenticated</h2>
                <div className="text-sm text-green-700 space-y-1">
                  <p><span className="font-medium">Email:</span> {user?.email?.address}</p>
                  <p><span className="font-medium">User ID:</span> {user?.id}</p>
                  {(walletId || seedPhrase || stacksAddresses || publicKey) && (
                    <p className="text-xs text-green-600 mt-2">
                      💾 Wallet data loaded from storage
                    </p>
                  )}
                  {authorizationSignature && (
                    <p className="text-xs text-blue-600 mt-1">
                      🔐 Authorization signature loaded
                    </p>
                  )}
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={handleGenerateSignature}
                      disabled={isGeneratingSignature}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                    >
                      {isGeneratingSignature ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        'Generate Authorization Signature'
                      )}
                    </button>

                  </div>
                  {authorizationKey && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="font-semibold text-green-800 text-sm mb-1 sm:mb-0">Access Token:</h4>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(authorizationKey);
                            alert('Access token copied to clipboard!');
                          }}
                          className="text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded transition-colors duration-200 self-start sm:self-auto"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="text-xs text-green-700 break-all overflow-x-auto max-w-full">{authorizationKey}</pre>
                    </div>
                  )}
                  {decodedKey && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="font-semibold text-yellow-800 text-sm mb-2">Decoded Key:</h4>
                      <pre className="text-xs text-yellow-700 break-all">{decodedKey}</pre>
                    </div>
                  )}
                </div>
              </div>

         


          
          

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Wallet</h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-emerald-600 text-xl">🔧</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-emerald-800 mb-2">Create New Wallets</h4>
                      <p className="text-sm text-emerald-700 mb-4">
                        Create new Bitcoin wallets using either client-side or server-side methods.
                      </p>
                      
                      <div className="flex gap-3 mb-4">
                        <button
                          onClick={handleCreateClientWallet}
                          disabled={isCreatingClientWallet || isCreatingServerWallet}
                          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                        >
                          {isCreatingClientWallet ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating Client-side...
                            </>
                          ) : (
                            'Create Client-side Wallet'
                          )}
                        </button>
                        
                        <button
                          onClick={handleCreateServerWallet}
                          disabled={isCreatingClientWallet || isCreatingServerWallet}
                          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                        >
                          {isCreatingServerWallet ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating Server-side...
                            </>
                          ) : (
                            'Create Server-side Wallet'
                          )}
                        </button>
                      </div>

                      {(walletCreationError || serverWalletCreationError) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="text-red-600">❌</div>
                            <div>
                              <h4 className="font-semibold text-red-800 text-sm">Creation Failed</h4>
                              <p className="text-sm text-red-700">{walletCreationError || serverWalletCreationError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {walletCreationSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="text-green-600">✅</div>
                            <div>
                              <h4 className="font-semibold text-green-800 text-sm">Success!</h4>
                              <p className="text-sm text-green-700">{walletCreationSuccess}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-emerald-600">
                        ℹ️ New wallets will appear in the "All Linked Accounts" section after creation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

           

              {user?.linkedAccounts && user.linkedAccounts.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Linked Accounts</h3>
                  <div className="space-y-2">
                    {user.linkedAccounts
                      .filter((account: any) => account.type === 'wallet')
                      .map((wallet: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="font-medium text-gray-700">Type:</span>{' '}
                              <span className="text-gray-600">{wallet.type}</span>
                            </div>
                            {wallet.walletClientType && (
                              <div>
                                <span className="font-medium text-gray-700">Client:</span>{' '}
                                <span className="text-gray-600">{wallet.walletClientType}</span>
                              </div>
                            )}
                            {wallet.chainType && (
                              <div>
                                <span className="font-medium text-gray-700">Chain:</span>{' '}
                                <span className="text-gray-600">{wallet.chainType}</span>
                              </div>
                            )}
                            {wallet.address && (
                              <div>
                                <span className="font-medium text-gray-700">Address:</span>{' '}
                                <span className="text-gray-600 break-all">{wallet.address}</span>
                              </div>
                            )}
                            {wallet.id && (
                              <div>
                                <span className="font-medium text-gray-700">ID:</span>{' '}
                                <span className="text-gray-600 font-mono text-xs">{wallet.id}</span>
                              </div>
                            )}
                            {walletPublicKeys[wallet.id] && (
                              <div>
                                <span className="font-medium text-gray-700">Public Key:</span>{' '}
                                <span className="text-gray-600 font-mono text-xs break-all">{walletPublicKeys[wallet.id]}</span>
                              </div>
                            )}
                            {walletPublicKeys[wallet.id] && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">Stacks Addresses:</div>
                                <div className="space-y-1">
                                  <div className="bg-purple-100 rounded p-2">
                                    <div className="text-xs">
                                      <span className="font-medium text-purple-700">Mainnet:</span>{' '}
                                      <span className="text-purple-600 font-mono break-all">
                                        {getAddressFromPublicKey(walletPublicKeys[wallet.id], 'mainnet')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="bg-blue-100 rounded p-2">
                                    <div className="text-xs">
                                      <span className="font-medium text-blue-700">Testnet:</span>{' '}
                                      <span className="text-blue-600 font-mono break-all">
                                        {getAddressFromPublicKey(walletPublicKeys[wallet.id], 'testnet')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {walletFullData[wallet.id] && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-500 mb-1">Full Wallet Data:</div>
                                <div className="bg-gray-100 rounded p-3 max-h-64 overflow-y-auto">
                                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                    {JSON.stringify(walletFullData[wallet.id], null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => addSessionSignerToWallet(wallet.address)}
                                disabled={addingSignerWalletAddress === wallet.address}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                              >
                                {addingSignerWalletAddress === wallet.address ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Adding...
                                  </>
                                ) : (
                                  'Add Signer'
                                )}
                              </button>
                              <button
                                onClick={() => handleExportWalletClientSide(wallet)}
                                disabled={!authenticated || wallet.walletClientType !== 'privy' || isExportingKey}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                              >
                                {isExportingKey ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Exporting...
                                  </>
                                ) : (
                                  'Export Client-side'
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleTransferSTX(wallet)}
                                disabled={!authenticated || wallet.walletClientType !== 'privy' || signingHttpWalletId === wallet.id}
                                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                              >
                                {signingHttpWalletId === wallet.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Transferring STX
                                  </>
                                ) : (
                                  'Transfer STX (testnet)'
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleBuyMeme(wallet)}
                                disabled={!authenticated || wallet.walletClientType !== 'privy' || buyingMemeWalletId === wallet.id}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                              >
                                {buyingMemeWalletId === wallet.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Buying Meme
                                  </>
                                ) : (
                                  '🚀 Buy Meme'
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleSellMeme(wallet)}
                                disabled={!authenticated || wallet.walletClientType !== 'privy' || sellingMemeWalletId === wallet.id}
                                className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                              >
                                {sellingMemeWalletId === wallet.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Selling Meme
                                  </>
                                ) : (
                                  '💰 Sell Meme'
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleDeployContract(wallet)}
                                disabled={!authenticated || wallet.walletClientType !== 'privy' || deployingContractWalletId === wallet.id}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center"
                              >
                                {deployingContractWalletId === wallet.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deploying...
                                  </>
                                ) : (
                                  '📜 Deploy Contract (testnet)'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {exportKeyError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-red-600">❌</div>
                        <div>
                          <h4 className="font-semibold text-red-800">Export Failed</h4>
                          <p className="text-sm text-red-700">{exportKeyError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {exportedKeyData && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-green-600 text-xl">🔐</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800 mb-2">Wallet Exported Successfully</h4>
                          <div className="bg-white border border-green-300 rounded p-3 mb-3">
                            <pre className="text-xs text-gray-800 overflow-x-auto">
                              {JSON.stringify(exportedKeyData, null, 2)}
                            </pre>
                          </div>
                          <p className="text-xs text-green-600">
                            ℹ️ Private key data has been exported and encrypted for secure transport.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {transferResult && transferResult.txid && (
                    <div className={`mt-4 ${transferResult.error ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                      <div className="flex items-start space-x-3">
                        <div className={`${transferResult.error ? 'text-red-600' : 'text-blue-600'} text-xl`}>
                          {transferResult.error ? '❌' : '✅'}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${transferResult.error ? 'text-red-800' : 'text-blue-800'} mb-2`}>
                            {transferResult.error ? 'Transaction Rejected' : 'Transaction Broadcast Successfully!'}
                          </h4>
                          
                          {transferResult.error && (
                            <div className="mb-3 space-y-2">
                              <div className="bg-white border border-red-300 rounded p-3">
                                <p className="text-xs text-gray-600 mb-1">Error:</p>
                                <p className="text-sm font-semibold text-red-700">{transferResult.error}</p>
                              </div>
                              {transferResult.reason && (
                                <div className="bg-white border border-red-300 rounded p-3">
                                  <p className="text-xs text-gray-600 mb-1">Reason:</p>
                                  <p className="text-sm font-semibold text-red-700">{transferResult.reason}</p>
                                  {transferResult.reason_data && (
                                    <div className="mt-2 text-xs">
                                      <p className="text-gray-600">Expected: {transferResult.reason_data.expected}</p>
                                      <p className="text-gray-600">Actual: {transferResult.reason_data.actual}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className={`bg-white border ${transferResult.error ? 'border-red-300' : 'border-blue-300'} rounded p-3`}>
                              <p className="text-xs text-gray-600 mb-1">Transaction ID:</p>
                              <p className="text-sm font-mono text-gray-800 break-all">{transferResult.txid}</p>
                            </div>
                            <a
                              href={`https://explorer.hiro.so/txid/0x${transferResult.txid}?chain=testnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center ${transferResult.error ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm`}
                            >
                              View on Explorer
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {transferError && !transferResult?.txid && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-red-600">❌</div>
                        <div>
                          <h4 className="font-semibold text-red-800">Transfer Failed</h4>
                          <p className="text-sm text-red-700">{transferError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {buyMemeResult && buyMemeResult.txid && (
                    <div className={`mt-4 ${buyMemeResult.error ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'} border rounded-lg p-4`}>
                      <div className="flex items-start space-x-3">
                        <div className={`${buyMemeResult.error ? 'text-red-600' : 'text-purple-600'} text-xl`}>
                          {buyMemeResult.error ? '❌' : '🚀'}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${buyMemeResult.error ? 'text-red-800' : 'text-purple-800'} mb-2`}>
                            {buyMemeResult.error ? 'Meme Purchase Rejected' : 'Meme Token Purchased Successfully!'}
                          </h4>
                          
                          {buyMemeResult.error && (
                            <div className="mb-3 space-y-2">
                              <div className="bg-white border border-red-300 rounded p-3">
                                <p className="text-xs text-gray-600 mb-1">Error:</p>
                                <p className="text-sm font-semibold text-red-700">{buyMemeResult.error}</p>
                              </div>
                              {buyMemeResult.reason && (
                                <div className="bg-white border border-red-300 rounded p-3">
                                  <p className="text-xs text-gray-600 mb-1">Reason:</p>
                                  <p className="text-sm font-semibold text-red-700">{buyMemeResult.reason}</p>
                                  {buyMemeResult.reason_data && (
                                    <div className="mt-2 text-xs">
                                      <p className="text-gray-600">Expected: {buyMemeResult.reason_data.expected}</p>
                                      <p className="text-gray-600">Actual: {buyMemeResult.reason_data.actual}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {buyMemeResult.transactionInfo && (
                            <div className="bg-white border border-purple-300 rounded p-3 mb-3">
                              <div className="text-xs space-y-1">
                                <div><span className="font-medium text-gray-700">Type:</span> {buyMemeResult.transactionInfo.type}</div>
                                <div><span className="font-medium text-gray-700">Token:</span> {buyMemeResult.transactionInfo.token}</div>
                                <div><span className="font-medium text-gray-700">Amount:</span> {buyMemeResult.transactionInfo.amount}</div>
                                <div><span className="font-medium text-gray-700">Network:</span> {buyMemeResult.transactionInfo.network}</div>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className={`bg-white border ${buyMemeResult.error ? 'border-red-300' : 'border-purple-300'} rounded p-3`}>
                              <p className="text-xs text-gray-600 mb-1">Transaction ID:</p>
                              <p className="text-sm font-mono text-gray-800 break-all">{buyMemeResult.txid}</p>
                            </div>
                            <a
                              href={`https://explorer.hiro.so/txid/0x${buyMemeResult.txid}?chain=mainnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center ${buyMemeResult.error ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm`}
                            >
                              View on Explorer
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {buyMemeError && !buyMemeResult?.txid && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-red-600">❌</div>
                        <div>
                          <h4 className="font-semibold text-red-800">Meme Purchase Failed</h4>
                          <p className="text-sm text-red-700">{buyMemeError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {sellMemeResult && sellMemeResult.txid && (
                    <div className={`mt-4 ${sellMemeResult.error ? 'bg-red-50 border-red-200' : 'bg-pink-50 border-pink-200'} border rounded-lg p-4`}>
                      <div className="flex items-start space-x-3">
                        <div className={`${sellMemeResult.error ? 'text-red-600' : 'text-pink-600'} text-xl`}>
                          {sellMemeResult.error ? '❌' : '💰'}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${sellMemeResult.error ? 'text-red-800' : 'text-pink-800'} mb-2`}>
                            {sellMemeResult.error ? 'Meme Sale Rejected' : 'Meme Token Sold Successfully!'}
                          </h4>
                          
                          {sellMemeResult.error && (
                            <div className="mb-3 space-y-2">
                              <div className="bg-white border border-red-300 rounded p-3">
                                <p className="text-xs text-gray-600 mb-1">Error:</p>
                                <p className="text-sm font-semibold text-red-700">{sellMemeResult.error}</p>
                              </div>
                              {sellMemeResult.reason && (
                                <div className="bg-white border border-red-300 rounded p-3">
                                  <p className="text-xs text-gray-600 mb-1">Reason:</p>
                                  <p className="text-sm font-semibold text-red-700">{sellMemeResult.reason}</p>
                                  {sellMemeResult.reason_data && (
                                    <div className="mt-2 text-xs">
                                      <p className="text-gray-600">Expected: {sellMemeResult.reason_data.expected}</p>
                                      <p className="text-gray-600">Actual: {sellMemeResult.reason_data.actual}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {sellMemeResult.transactionInfo && (
                            <div className="bg-white border border-pink-300 rounded p-3 mb-3">
                              <div className="text-xs space-y-1">
                                <div><span className="font-medium text-gray-700">Type:</span> {sellMemeResult.transactionInfo.type}</div>
                                <div><span className="font-medium text-gray-700">Token:</span> {sellMemeResult.transactionInfo.token}</div>
                                <div><span className="font-medium text-gray-700">Amount:</span> {sellMemeResult.transactionInfo.amount}</div>
                                <div><span className="font-medium text-gray-700">Network:</span> {sellMemeResult.transactionInfo.network}</div>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className={`bg-white border ${sellMemeResult.error ? 'border-red-300' : 'border-pink-300'} rounded p-3`}>
                              <p className="text-xs text-gray-600 mb-1">Transaction ID:</p>
                              <p className="text-sm font-mono text-gray-800 break-all">{sellMemeResult.txid}</p>
                            </div>
                            <a
                              href={`https://explorer.hiro.so/txid/0x${sellMemeResult.txid}?chain=mainnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center ${sellMemeResult.error ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'} text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm`}
                            >
                              View on Explorer
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {sellMemeError && !sellMemeResult?.txid && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-red-600">❌</div>
                        <div>
                          <h4 className="font-semibold text-red-800">Meme Sale Failed</h4>
                          <p className="text-sm text-red-700">{sellMemeError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {deployContractResult && deployContractResult.txid && (
                    <div className={`mt-4 ${deployContractResult.error ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-200'} border rounded-lg p-4`}>
                      <div className="flex items-start space-x-3">
                        <div className={`${deployContractResult.error ? 'text-red-600' : 'text-indigo-600'} text-xl`}>
                          {deployContractResult.error ? '❌' : '📜'}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${deployContractResult.error ? 'text-red-800' : 'text-indigo-800'} mb-2`}>
                            {deployContractResult.error ? 'Contract Deployment Rejected' : 'Contract Deployed Successfully!'}
                          </h4>
                          
                          {deployContractResult.error && (
                            <div className="mb-3 space-y-2">
                              <div className="bg-white border border-red-300 rounded p-3">
                                <p className="text-xs text-gray-600 mb-1">Error:</p>
                                <p className="text-sm font-semibold text-red-700">{deployContractResult.error}</p>
                              </div>
                              {deployContractResult.reason && (
                                <div className="bg-white border border-red-300 rounded p-3">
                                  <p className="text-xs text-gray-600 mb-1">Reason:</p>
                                  <p className="text-sm font-semibold text-red-700">{deployContractResult.reason}</p>
                                  {deployContractResult.reason_data && (
                                    <div className="mt-2 text-xs">
                                      <p className="text-gray-600">Expected: {deployContractResult.reason_data.expected}</p>
                                      <p className="text-gray-600">Actual: {deployContractResult.reason_data.actual}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {deployContractResult.transactionInfo && (
                            <div className="bg-white border border-indigo-300 rounded p-3 mb-3">
                              <div className="text-xs space-y-1">
                                <div><span className="font-medium text-gray-700">Type:</span> {deployContractResult.transactionInfo.type}</div>
                                <div><span className="font-medium text-gray-700">Contract:</span> {deployContractResult.transactionInfo.contract}</div>
                                <div><span className="font-medium text-gray-700">Network:</span> {deployContractResult.transactionInfo.network}</div>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className={`bg-white border ${deployContractResult.error ? 'border-red-300' : 'border-indigo-300'} rounded p-3`}>
                              <p className="text-xs text-gray-600 mb-1">Transaction ID:</p>
                              <p className="text-sm font-mono text-gray-800 break-all">{deployContractResult.txid}</p>
                            </div>
                            <a
                              href={`https://explorer.hiro.so/txid/0x${deployContractResult.txid}?chain=testnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center ${deployContractResult.error ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm`}
                            >
                              View on Explorer
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {deployContractError && !deployContractResult?.txid && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-red-600">❌</div>
                        <div>
                          <h4 className="font-semibold text-red-800">Contract Deployment Failed</h4>
                          <p className="text-sm text-red-700">{deployContractError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t pt-6 space-y-3">
                {(walletId || seedPhrase || stacksAddresses || publicKey) && (
                  <button
                    onClick={clearWalletStorage}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Clear Stored Wallet Data
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
