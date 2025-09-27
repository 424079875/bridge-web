<template>
  <header class="global-header">
    <img class="logo" src="@/assets/icon-placeholder.svg" alt="" />
    <span class="title">DTC Bridge</span>
    <div class="flex-1"></div>
    <!-- <div class="lang-select">
      <div class="lang-select-btn">
        <img src="@/assets/icon_lang.png" alt="" @click="$emit('toggleLangDropdown')" />
      </div>
      <div class="lang-dropdown" v-show="langDropdownActive">
        <div class="lang-dropdown-item" v-for="lang in langList" :key="lang.value" @click="$emit('changeLang', lang.value)">
          <span>{{ lang.label }}</span>
        </div>
      </div>
    </div> -->
    <div class="wallet-connect">
      <div class="wallet-connect-btn" v-if="!isConnected" @click="$emit('walletConnect')">{{ connectWalletText }}</div>
      <div
        class="wallet-connect-btn"
        :style="{ borderRadius: walletDropdownActive ? '14px 14px 0 0' : '14px' }"
        @click="$emit('walletDropdown')"
        v-else
      >
        <div class="wallet-address">{{ addressShort }}</div>
        <img class="wallet-arrow" src="@/assets/icon_arrow_down_2.png" alt="" />
      </div>
      <div class="wallet-dropdown" v-show="walletDropdownActive">
        <div class="wallet-dropdown-wrapper">
          <div class="wallet-dropdown-item" @click="$emit('copyText', address)">
            <img src="@/assets/icon_copy.png" alt="" />
            <span>{{ copyAaddressText }}</span>
          </div>
          <div class="wallet-dropdown-item" @click="$emit('openExplorer')">
            <img src="@/assets/icon_browser.png" alt="" />
            <span>{{ browserViewText }}</span>
          </div>
          <div class="wallet-dropdown-item" @click="$emit('walletDisconnect')">
            <img src="@/assets/icon_disconnect.png" alt="" />
            <span>{{ disconnectText }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="network-select" v-if="isConnected">
      <div class="network-select-btn" @click="$emit('networkDropdown')">
        <img class="network-icon" :src="networkIcon" alt="" />
        <img class="network-arrow" src="@/assets/icon_arrow_down_2.png" alt="" />
      </div>
      <div class="network-dropdown" v-show="networkDropdownActive">
        <div class="network-dropdown-item" v-for="chain in allChainList" :key="chain.chainId" @click="$emit('networkChange', chain.chainId)">
          <img :src="getChainIcon(chain.chainId)" alt="" />
          <span>{{ chain.name }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
// props 由父组件传递
const props = defineProps({
  langDropdownActive: Boolean,
  walletDropdownActive: Boolean,
  networkDropdownActive: Boolean,
  langList: Array,
  isConnected: Boolean,
  address: String,
  addressShort: String,
  connectWalletText: String,
  copyAaddressText: String,
  browserViewText: String,
  disconnectText: String,
  networkIcon: String,
  allChainList: Array,
  getChainIcon: Function,
});
</script>

<style scoped lang="scss">
.global-header {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100vw - 64px);
  z-index: 100;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 60px;
  padding: 0 32px;
  gap: 16px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
.logo{
  height: 40px;
  width: 40px;
}
.title{
  font-size: 20px;
  font-weight: bold;
}
.lang-select {
  position: relative;
  height: 28px;
  margin: 0 10px;
  cursor: pointer;
  .lang-select-btn {
    display: flex;
    align-items: center;
    height: 28px;
    img {
      display: block;
      width: 24px;
      height: 24px;
    }
  }
  .lang-dropdown {
    position: absolute;
    left: 50%;
    min-width: 120px;
    margin-top: 4px;
    transform: translateX(-50%);
    border: 1px solid #1b1a3b;
    border-radius: 14px;
    background: #f5f8ff;
    .lang-dropdown-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      padding: 0 10px;
      border-bottom: 1px solid rgb(27 26 59 / 10%);
      color: #1b1a3b;
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
.wallet-connect {
  position: relative;
  width: 140px;
  height: 36px;
  background: #f5f8ff;
  cursor: pointer;
  .wallet-connect-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid #1b1a3b;
    border-radius: 14px;
    color: #1b1a3b;
    font-size: 15px;
    font-weight: 500;
    .wallet-address {
      flex: 1;
      padding-left: 10px;
      overflow: hidden;
    }
    .wallet-arrow {
      width: 16px;
      height: 16px;
      margin: 0 5px;
    }
  }
  .wallet-dropdown {
    position: absolute;
    width: 100%;
    background: #f5f8ff;
    cursor: pointer;
    .wallet-dropdown-wrapper {
      width: 100%;
      border: 1px solid #1b1a3b;
      border-top-width: 0;
      border-radius: 0 0 14px 14px;
      .wallet-dropdown-item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 10px;
        border-bottom: 1px solid rgb(27 26 59 / 10%);
        color: #1b1a3b;
        font-size: 14px;
        font-weight: 500;
        line-height: 1;
        &:last-child {
          border-bottom: none;
        }
        img {
          width: 20px;
          height: 20px;
          margin-right: 6px;
        }
      }
    }
  }
}
.network-select {
  position: relative;
  margin-left: 10px;
  cursor: pointer;
  .network-select-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    border: 1px solid #1b1a3b;
    border-radius: 14px;
    background: #f5f8ff;
    font-weight: 500;
    .network-icon {
      width: 20px;
      height: 20px;
      margin: 0 4px;
      border-radius: 20px;
    }
    .network-arrow {
      width: 16px;
      height: 16px;
      margin-right: 5px;
    }
  }
  .network-dropdown {
    position: absolute;
    right: 0;
    min-width: 140px;
    margin-top: 4px;
    border: 1px solid #1b1a3b;
    border-radius: 14px;
    background: #f5f8ff;
    .network-dropdown-item {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      border-bottom: 1px solid rgb(27 26 59 / 10%);
      color: #1b1a3b;
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      &:last-child {
        border-bottom: none;
      }
      img {
        width: 20px;
        height: 20px;
        margin-right: 4px;
        border-radius: 20px;
      }
    }
  }
}
</style>
