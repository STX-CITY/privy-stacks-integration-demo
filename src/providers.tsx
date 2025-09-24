'use client';

import {PrivyProvider} from '@privy-io/react-auth';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id'}
      config={{
        loginMethods: ['email','wallet','passkey','google','twitter'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          createOnLogin: 'off',
        },
        supportedChains: [
          {
            id: 1,
            name: 'Ethereum',
            network: 'ethereum',
            nativeCurrency: {
              decimals: 18,
              name: 'Ether',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: {
                http: ['https://eth.llamarpc.com'],
              },
            },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}