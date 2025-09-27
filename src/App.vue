<template>
  <router-view />
</template>
<script setup lang="ts">
  // import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'

  // // 1. Your WalletConnect Cloud project ID
  // const projectId = '6875db1de38dc4aba8eea69664eeb3a6'

  // // 2. Set chains
  // const mainnet = {
  //   chainId: 1,
  //   name: 'Ethereum',
  //   currency: 'ETH',
  //   explorerUrl: 'https://etherscan.io',
  //   rpcUrl: 'https://cloudflare-eth.com'
  // }

  // // 3. Create your application's metadata object
  // const metadata = {
  //   name: 'Kad',
  //   description: 'Web3Modal Example',
  //   url: 'https://web3modal.com', // origin must match your domain & subdomain
  //   icons: ['https://avatars.githubusercontent.com/u/37784886']
  // }

  // // 4. Create Ethers config
  // const ethersConfig = defaultConfig({
  //   /*Required*/
  //   metadata,

  //   /*Optional*/
  //   enableEIP6963: true, // true by default
  //   enableInjected: true, // true by default
  //   enableCoinbase: true, // true by default
  //   rpcUrl: '...', // used for the Coinbase SDK
  //   defaultChainId: 1, // used for the Coinbase SDK
  // });

  // // 5. Create a Web3Modal instance
  // const modal = createWeb3Modal({
  //   ethersConfig,
  //   chains: [mainnet],
  //   projectId,
  //   enableAnalytics: true, // Optional - defaults to your Cloud configuration
  //   enableOnramp: true // Optional - false as default
  // })
</script>

<style>
  #app {
    color: #2c3e50;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #F5FAF8;
  }

  /* 修改滚动条宽度 */
  ::-webkit-scrollbar {
    width: 0;
  }

  :root {
    --viewport-width: 375px; /* 设置基础宽度为375px */
  }
</style>
