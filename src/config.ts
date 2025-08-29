import { http, createConfig } from '@wagmi/vue';
import { mainnet, bscTestnet, arbitrum, arbitrumSepolia, sepolia } from '@wagmi/vue/chains';
import { injected } from '@wagmi/vue/connectors';
import { defineChain } from 'viem';
// const projectId = '6875db1de38dc4aba8eea69664eeb3a6'

// const kadsea = defineChain({
//   id: 878,
//   name: 'Kad Sea',
//   nativeCurrency: { name: 'kad', symbol: 'KAD', decimals: 18 },
//   rpcUrls: {
//     default: { http: ['https://rpc.orcchain.io', 'https://rpc.kadchain.cc'] },
//   },
//   blockExplorers: {
//     default: { name: 'Kadscan', url: 'https://kadscan.kadsea.org' },
//   },
// });
const bsc = /*#__PURE__*/ defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed3.defibit.io'] },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://bscscan.com',
      apiUrl: 'https://api.bscscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 15921452,
    },
  },
});

// const customBsc = {
//   ...bsc,
//   rpcUrls: {
//     default: { http: ['https://your-custom-rpc-url.com'] },
//     public: { http: ['https://your-custom-rpc-url.com'] },
//   },
// };

const dtc = defineChain({
  id: 18569,
  name: 'DTC Chain',
  nativeCurrency: { name: 'dtc', symbol: 'DTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://node.datachain.top'] },
  },
  blockExplorers: {
    default: { name: 'DTCscan', url: 'https://explorer.datachain.top' },
  },
});
export const config = createConfig({
  chains: [dtc, mainnet, sepolia, bsc, bscTestnet, arbitrum, arbitrumSepolia],
  connectors: [
    injected(),
    // walletConnect({ projectId }),
  ],
  transports: {
    [dtc.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http('https://bsc-dataseed3.defibit.io'),
    [bscTestnet.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
