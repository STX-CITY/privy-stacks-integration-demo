'use client';

import {useState, useEffect} from 'react';
import { getAddressFromPublicKey } from '@stacks/transactions';

export default function TestPage() {
  const [walletId, setWalletId] = useState<string>('');
  const [isTransferringSTX, setIsTransferringSTX] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isBuyingMeme, setIsBuyingMeme] = useState(false);
  const [buyMemeResult, setBuyMemeResult] = useState<any>(null);
  const [buyMemeError, setBuyMemeError] = useState<string | null>(null);
  const [isBuyingMemeTestnet, setIsBuyingMemeTestnet] = useState(false);
  const [buyMemeTestnetResult, setBuyMemeTestnetResult] = useState<any>(null);
  const [buyMemeTestnetError, setBuyMemeTestnetError] = useState<string | null>(null);
  const [isSellingMeme, setIsSellingMeme] = useState(false);
  const [sellMemeResult, setSellMemeResult] = useState<any>(null);
  const [sellMemeError, setSellMemeError] = useState<string | null>(null);
  const [isDeployingToken, setIsDeployingToken] = useState(false);
  const [deployTokenResult, setDeployTokenResult] = useState<any>(null);
  const [deployTokenError, setDeployTokenError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [stacksAddresses, setStacksAddresses] = useState<{testnet: string | null, mainnet: string | null}>({testnet: null, mainnet: null});

  // Function to fetch wallet data and calculate addresses
  const fetchWalletData = async () => {
    if (!walletId.trim()) {
      setWalletData(null);
      setStacksAddresses({testnet: null, mainnet: null});
      return;
    }

    try {
      setIsLoadingWallet(true);
      const response = await fetch(`/api/get-wallet?walletId=${walletId.trim()}`);
      const result = await response.json();
      
      if (response.ok && result.data) {
        setWalletData(result.data);
        
        // Calculate Stacks addresses if public key exists
        if (result.data.publicKey) {
          const publicKey = result.data.publicKey;
          const testnetAddress = getAddressFromPublicKey(publicKey, 'testnet');
          const mainnetAddress = getAddressFromPublicKey(publicKey, 'mainnet');
          setStacksAddresses({
            testnet: testnetAddress,
            mainnet: mainnetAddress
          });
        }
      } else {
        console.error('Failed to fetch wallet data:', result.error);
        setWalletData(null);
        setStacksAddresses({testnet: null, mainnet: null});
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setWalletData(null);
      setStacksAddresses({testnet: null, mainnet: null});
    } finally {
      setIsLoadingWallet(false);
    }
  };

  // Fetch wallet data when wallet ID changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWalletData();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [walletId]);

  // Function to handle Transfer STX
  const handleTransferSTX = async () => {
    if (!walletId.trim()) {
      setTransferError('Please enter a wallet ID');
      return;
    }

    try {
      setIsTransferringSTX(true);
      setTransferError(null);
      setTransferResult(null);

      const response = await fetch('/api/transfer-stx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId: walletId.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.txid) {
          setTransferResult({
            txid: result.txid,
            walletId: walletId.trim(),
            error: result.error,
            reason: result.reason,
            reason_data: result.reason_data
          });
          setTransferError(`${result.error}: ${result.reason}`);
        } else {
          throw new Error(result.error || 'Failed to transfer STX');
        }
      } else {
        if (result.txid) {
          setTransferResult({
            txid: result.txid,
            walletId: walletId.trim(),
            success: true
          });
        } else {
          setTransferResult(result);
        }
      }

    } catch (error) {
      console.error('Error transferring STX:', error);
      setTransferError(error instanceof Error ? error.message : 'Failed to transfer STX');
    } finally {
      setIsTransferringSTX(false);
    }
  };

  // Function to handle Buy Meme
  const handleBuyMeme = async () => {
    if (!walletId.trim()) {
      setBuyMemeError('Please enter a wallet ID');
      return;
    }

    try {
      setIsBuyingMeme(true);
      setBuyMemeError(null);
      setBuyMemeResult(null);

      const response = await fetch('/api/buy-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId: walletId.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.txid) {
          setBuyMemeResult({
            txid: result.txid,
            walletId: walletId.trim(),
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
        if (result.txid) {
          setBuyMemeResult({
            txid: result.txid,
            walletId: walletId.trim(),
            success: true,
            transactionInfo: result.transactionInfo
          });
        } else {
          setBuyMemeResult(result);
        }
      }

    } catch (error) {
      console.error('Error buying meme token:', error);
      setBuyMemeError(error instanceof Error ? error.message : 'Failed to buy meme token');
    } finally {
      setIsBuyingMeme(false);
    }
  };

  // Function to handle Buy Meme Testnet
  const handleBuyMemeTestnet = async () => {
    if (!walletId.trim()) {
      setBuyMemeTestnetError('Please enter a wallet ID');
      return;
    }

    try {
      setIsBuyingMemeTestnet(true);
      setBuyMemeTestnetError(null);
      setBuyMemeTestnetResult(null);

      const response = await fetch('/api/buy-meme-testnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId: walletId.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.txid) {
          setBuyMemeTestnetResult({
            txid: result.txid,
            walletId: walletId.trim(),
            error: result.error,
            reason: result.reason,
            reason_data: result.reason_data,
            transactionInfo: result.transactionInfo
          });
          setBuyMemeTestnetError(`${result.error}: ${result.reason}`);
        } else {
          throw new Error(result.error || 'Failed to buy meme token on testnet');
        }
      } else {
        if (result.txid) {
          setBuyMemeTestnetResult({
            txid: result.txid,
            walletId: walletId.trim(),
            success: true,
            transactionInfo: result.transactionInfo
          });
        } else {
          setBuyMemeTestnetResult(result);
        }
      }

    } catch (error) {
      console.error('Error buying meme token on testnet:', error);
      setBuyMemeTestnetError(error instanceof Error ? error.message : 'Failed to buy meme token on testnet');
    } finally {
      setIsBuyingMemeTestnet(false);
    }
  };

  // Function to handle Sell Meme
  const handleSellMeme = async () => {
    if (!walletId.trim()) {
      setSellMemeError('Please enter a wallet ID');
      return;
    }

    try {
      setIsSellingMeme(true);
      setSellMemeError(null);
      setSellMemeResult(null);

      const response = await fetch('/api/sell-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId: walletId.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.txid) {
          setSellMemeResult({
            txid: result.txid,
            walletId: walletId.trim(),
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
        if (result.txid) {
          setSellMemeResult({
            txid: result.txid,
            walletId: walletId.trim(),
            success: true,
            transactionInfo: result.transactionInfo
          });
        } else {
          setSellMemeResult(result);
        }
      }

    } catch (error) {
      console.error('Error selling meme token:', error);
      setSellMemeError(error instanceof Error ? error.message : 'Failed to sell meme token');
    } finally {
      setIsSellingMeme(false);
    }
  };

  // Function to handle Deploy Token
  const handleDeployToken = async () => {
    if (!walletId.trim()) {
      setDeployTokenError('Please enter a wallet ID');
      return;
    }

    try {
      setIsDeployingToken(true);
      setDeployTokenError(null);
      setDeployTokenResult(null);

      const response = await fetch('/api/deploy-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId: walletId.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.txid) {
          setDeployTokenResult({
            txid: result.txid,
            walletId: walletId.trim(),
            error: result.error,
            reason: result.reason,
            reason_data: result.reason_data,
            transactionInfo: result.transactionInfo
          });
          setDeployTokenError(`${result.error}: ${result.reason}`);
        } else {
          throw new Error(result.error || 'Failed to deploy token');
        }
      } else {
        if (result.txid) {
          setDeployTokenResult({
            txid: result.txid,
            walletId: walletId.trim(),
            success: true,
            transactionInfo: result.transactionInfo
          });
        } else {
          setDeployTokenResult(result);
        }
      }

    } catch (error) {
      console.error('Error deploying token:', error);
      setDeployTokenError(error instanceof Error ? error.message : 'Failed to deploy token');
    } finally {
      setIsDeployingToken(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Page</h1>
            <p className="text-gray-600">Test Stacks transactions without Privy authentication</p>
          </div>

          <div className="space-y-6">
            {/* Wallet ID Input */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Configuration</h3>
              <div>
                <label htmlFor="walletId" className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet ID
                </label>
                <input
                  type="text"
                  id="walletId"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  placeholder="Enter your wallet ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Wallet Information Display */}
              {isLoadingWallet && (
                <div className="mt-4 text-sm text-gray-500">
                  Loading wallet information...
                </div>
              )}

              {walletData && !isLoadingWallet && (
                <div className="mt-4 space-y-3">
                  {/* Public Key */}
                  {walletData.publicKey && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Public Key
                      </label>
                      <div className="bg-white border border-gray-300 rounded px-3 py-2">
                        <p className="text-xs font-mono text-gray-800 break-all">{walletData.publicKey}</p>
                      </div>
                    </div>
                  )}

                  {/* Stacks Addresses */}
                  {stacksAddresses.testnet && stacksAddresses.mainnet && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Stacks Addresses
                      </label>
                      
                      {/* Testnet Address */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-blue-700">Testnet</span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Used for STX Transfer & Deploy</span>
                        </div>
                        <p className="text-xs font-mono text-blue-800 break-all">{stacksAddresses.testnet}</p>
                      </div>

                      {/* Mainnet Address */}
                      <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-purple-700">Mainnet</span>
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">Used for Buy/Sell Meme</span>
                        </div>
                        <p className="text-xs font-mono text-purple-800 break-all">{stacksAddresses.mainnet}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <button
                  onClick={handleTransferSTX}
                  disabled={isTransferringSTX || !walletId.trim()}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isTransferringSTX ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Transferring...
                    </>
                  ) : (
                    'Transfer STX'
                  )}
                </button>

                <button
                  onClick={handleBuyMeme}
                  disabled={isBuyingMeme || !walletId.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isBuyingMeme ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Buying...
                    </>
                  ) : (
                    '🚀 Buy Meme'
                  )}
                </button>

                <button
                  onClick={handleBuyMemeTestnet}
                  disabled={isBuyingMemeTestnet || !walletId.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isBuyingMemeTestnet ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Buying...
                    </>
                  ) : (
                    '🧪 Buy Meme Testnet'
                  )}
                </button>

                <button
                  onClick={handleSellMeme}
                  disabled={isSellingMeme || !walletId.trim()}
                  className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isSellingMeme ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Selling...
                    </>
                  ) : (
                    '💰 Sell Meme'
                  )}
                </button>

                <button
                  onClick={handleDeployToken}
                  disabled={isDeployingToken || !walletId.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isDeployingToken ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Deploying...
                    </>
                  ) : (
                    '📜 Deploy Token'
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {/* Transfer STX Results */}
              {transferResult && transferResult.txid && (
                <div className={`${transferResult.error ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                  <div className="flex items-start space-x-3">
                    <div className={`${transferResult.error ? 'text-red-600' : 'text-blue-600'} text-xl`}>
                      {transferResult.error ? '❌' : '✅'}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${transferResult.error ? 'text-red-800' : 'text-blue-800'} mb-2`}>
                        {transferResult.error ? 'STX Transfer Rejected' : 'STX Transfer Successful!'}
                      </h4>
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
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {transferError && !transferResult?.txid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-red-600">❌</div>
                    <div>
                      <h4 className="font-semibold text-red-800">Transfer Failed</h4>
                      <p className="text-sm text-red-700">{transferError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buy Meme Results */}
              {buyMemeResult && buyMemeResult.txid && (
                <div className={`${buyMemeResult.error ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'} border rounded-lg p-4`}>
                  <div className="flex items-start space-x-3">
                    <div className={`${buyMemeResult.error ? 'text-red-600' : 'text-purple-600'} text-xl`}>
                      {buyMemeResult.error ? '❌' : '🚀'}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${buyMemeResult.error ? 'text-red-800' : 'text-purple-800'} mb-2`}>
                        {buyMemeResult.error ? 'Meme Purchase Rejected' : 'Meme Token Purchased Successfully!'}
                      </h4>
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
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {buyMemeError && !buyMemeResult?.txid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-red-600">❌</div>
                    <div>
                      <h4 className="font-semibold text-red-800">Meme Purchase Failed</h4>
                      <p className="text-sm text-red-700">{buyMemeError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Buy Meme Testnet Results */}
              {buyMemeTestnetResult && buyMemeTestnetResult.txid && (
                <div className={`${buyMemeTestnetResult.error ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                  <div className="flex items-start space-x-3">
                    <div className={`${buyMemeTestnetResult.error ? 'text-red-600' : 'text-blue-600'} text-xl`}>
                      {buyMemeTestnetResult.error ? '❌' : '🧪'}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${buyMemeTestnetResult.error ? 'text-red-800' : 'text-blue-800'} mb-2`}>
                        {buyMemeTestnetResult.error ? 'Testnet Meme Purchase Rejected' : 'Testnet Meme Token Purchased Successfully!'}
                      </h4>
                      <div className="space-y-2">
                        <div className={`bg-white border ${buyMemeTestnetResult.error ? 'border-red-300' : 'border-blue-300'} rounded p-3`}>
                          <p className="text-xs text-gray-600 mb-1">Transaction ID:</p>
                          <p className="text-sm font-mono text-gray-800 break-all">{buyMemeTestnetResult.txid}</p>
                        </div>
                        <a
                          href={`https://explorer.hiro.so/txid/0x${buyMemeTestnetResult.txid}?chain=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center ${buyMemeTestnetResult.error ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm`}
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {buyMemeTestnetError && !buyMemeTestnetResult?.txid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-red-600">❌</div>
                    <div>
                      <h4 className="font-semibold text-red-800">Testnet Meme Purchase Failed</h4>
                      <p className="text-sm text-red-700">{buyMemeTestnetError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sell Meme Results */}
              {sellMemeResult && sellMemeResult.txid && (
                <div className={`${sellMemeResult.error ? 'bg-red-50 border-red-200' : 'bg-pink-50 border-pink-200'} border rounded-lg p-4`}>
                  <div className="flex items-start space-x-3">
                    <div className={`${sellMemeResult.error ? 'text-red-600' : 'text-pink-600'} text-xl`}>
                      {sellMemeResult.error ? '❌' : '💰'}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${sellMemeResult.error ? 'text-red-800' : 'text-pink-800'} mb-2`}>
                        {sellMemeResult.error ? 'Meme Sale Rejected' : 'Meme Token Sold Successfully!'}
                      </h4>
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
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sellMemeError && !sellMemeResult?.txid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-red-600">❌</div>
                    <div>
                      <h4 className="font-semibold text-red-800">Meme Sale Failed</h4>
                      <p className="text-sm text-red-700">{sellMemeError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Deploy Token Results */}
              {deployTokenResult && deployTokenResult.txid && (
                <div className={`${deployTokenResult.error ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-200'} border rounded-lg p-4`}>
                  <div className="flex items-start space-x-3">
                    <div className={`${deployTokenResult.error ? 'text-red-600' : 'text-indigo-600'} text-xl`}>
                      {deployTokenResult.error ? '❌' : '📜'}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${deployTokenResult.error ? 'text-red-800' : 'text-indigo-800'} mb-2`}>
                        {deployTokenResult.error ? 'Token Deployment Rejected' : 'Token Deployed Successfully!'}
                      </h4>
                      <div className="space-y-2">
                        <div className={`bg-white border ${deployTokenResult.error ? 'border-red-300' : 'border-indigo-300'} rounded p-3`}>
                          <p className="text-xs text-gray-600 mb-1">Transaction ID:</p>
                          <p className="text-sm font-mono text-gray-800 break-all">{deployTokenResult.txid}</p>
                        </div>
                        <a
                          href={`https://explorer.hiro.so/txid/0x${deployTokenResult.txid}?chain=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center ${deployTokenResult.error ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm`}
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {deployTokenError && !deployTokenResult?.txid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-red-600">❌</div>
                    <div>
                      <h4 className="font-semibold text-red-800">Token Deployment Failed</h4>
                      <p className="text-sm text-red-700">{deployTokenError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}