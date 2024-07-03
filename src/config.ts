import { http, createConfig } from '@wagmi/vue';
import { mainnet, bsc, bscTestnet, arbitrum, arbitrumSepolia, sepolia } from '@wagmi/vue/chains';
import { injected } from '@wagmi/vue/connectors';
import { defineChain } from 'viem';
// const projectId = '6875db1de38dc4aba8eea69664eeb3a6'

const kadsea = defineChain({
  id: 878,
  name: 'Kad Sea',
  nativeCurrency: { name: 'kad', symbol: 'KAD', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.orcchain.io', 'https://rpc.kadchain.cc'] },
  },
  blockExplorers: {
    default: { name: 'Kadscan', url: 'https://kadscan.kadsea.org' },
  },
});

export const config = createConfig({
  chains: [kadsea, mainnet, sepolia, bsc, bscTestnet, arbitrum, arbitrumSepolia],
  connectors: [
    injected(),
    // walletConnect({ projectId }),
  ],
  transports: {
    [kadsea.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
