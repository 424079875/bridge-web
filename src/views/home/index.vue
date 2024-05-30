<template>
  <div class="home-page">
    <div class="header">
      <img class="logo" src="@/assets/icon_logo.png" alt="" />
      <div class="flex-1"></div>
      <!-- <button
    v-for="connector in connectors"
    @click="connect({ connector, chainId })"
  >
    {{ connector.name }}
  </button> -->

      <div class="wallet-connect">
        <div
          class="wallet-connect-btn"
          v-if="!isConnected"
          v-for="connector in connectors.filter((item) => item.id == 'injected')"
          @click="walletConnect(connector)"
          >链接钱包</div
        >
        <div
          class="wallet-connect-btn"
          :style="{ borderRadius: walletDropdownActive ? '14px 14px 0 0' : '14px' }"
          @click="walletDropdown"
          v-else
        >
          <div class="wallet-address">{{ address?.toString().replace(/^(.{4}).*(.{4})$/, '$1...$2') }}</div>
          <img class="wallet-arrow" src="@/assets/icon_arrow_down_2.png" alt="" />
        </div>

        <div class="wallet-dropdown" v-show="walletDropdownActive">
          <div class="wallet-dropdown-wrapper">
            <div class="wallet-dropdown-item" @click="copyText(address), (walletDropdownActive = false)">
              <img src="@/assets/icon_copy.png" alt="" />
              <span>复制地址</span>
            </div>
            <div class="wallet-dropdown-item" @click="openExplorer()">
              <img src="@/assets/icon_browser.png" alt="" />
              <span>浏览器查看</span>
            </div>
            <!-- <div class="wallet-dropdown-item" @click="walletDisconnect()">
              <img src="@/assets/icon_disconnect.png" alt="">
              <span>断开</span>
            </div> -->
          </div>
        </div>
      </div>

      <div class="network-select" v-if="isConnected" @click="networkDropdown">
        <div class="network-select-btn">
          <img class="network-icon" :src="getChainIcon(chainId)" alt="" />
          <img class="network-arrow" src="@/assets/icon_arrow_down_2.png" alt="" />
        </div>

        <div class="network-dropdown" v-show="networkDropdownActive">
          <div class="network-dropdown-item" v-for="chain in allChainList" :key="chain.chainId" @click="networkChange(chain.chainId)">
            <img :src="getChainIcon(chain.chainId)" alt="" />
            <span>{{ chain.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="form">
      <div class="form-item">
        <div class="item-title">
          <span>选择跨链资产</span>
          <span v-if="isConnected">余额：<span class="balance">{{ tokenBalance?.data?.value?.formatted ?? '--' }}</span></span>
        </div>
        <div class="input-number">
          <div class="coin-drop-down" @click="coinDropdownActiveChange()">
            <img class="coin-img" :src="coinIcon" alt="" />
            <span class="coin-name">{{ coinName }}</span>
            <img class="coin-arrow" src="@/assets/icon_arrow_down.png" alt="" />
          </div>
          <input type="number" v-model="coinNum" placeholder="输入数量" />
        </div>
      </div>

      <div class="form-item">
        <div class="item-title">
          <span>转出链</span>
        </div>
        <div class="chain-wrapper">
          <div class="chain-drop-down" @click="sourceChainDropdownActiveChange()">
            <img class="chain-img" :src="getChainIcon(chainId)" alt="" />
            <span class="chain-name">{{ getChainName(chainId) }}</span>
            <img class="chain-arrow" src="@/assets/icon_arrow_down_1.png" alt="" />
          </div>
          <img class="chain-right" src="@/assets/icon_arrow_right.png" alt="" />
          <div class="chain-drop-down" @click="targetChainDropdownActiveChange()">
            <img class="chain-img" :src="getChainIcon(targetChainList[targetChainIndex]?.chainId)" alt="" />
            <span class="chain-name">{{ getChainName(targetChainList[targetChainIndex]?.chainId) }}</span>
            <img class="chain-arrow" src="@/assets/icon_arrow_down_1.png" alt="" />
          </div>
        </div>
      </div>

      <div class="form-item">
        <div class="item-title">
          <span>收款地址</span>
        </div>
        <input type="text" class="input-address" v-model="toAccountAddress" placeholder="请输入收款地址" />
      </div>

      <div class="form-item" style="margin-bottom: 30px">
        <div class="item-title">
          <span>手续费</span>
        </div>
        <div class="fee-wrapper">{{ feeValue }} {{ coinList[coinIndex]?.name ?? '' }}</div>
      </div>

      <div class="submit-button" @click="connectedCheck()" v-if="!isConnected">链接钱包</div>
      <div
        class="submit-button"
        @click="approve()"
        v-else-if="!allowanceResult.data.value && !isAllowanceed && coinList[coinIndex]?.type != 'native'"
        >{{ isAllowanceing ? '授权中...' : '授权' }}</div
      >
      <div class="submit-button" @click="submit()" v-else>确定</div>
    </div>

    <div class="record-wrapper">
      <div class="record-title">跨链记录</div>
      <nut-empty description="暂无数据" v-if="orderList.length == 0"></nut-empty>
      <div class="record-item" v-for="item in orderList" @click="toDetail(item)">
        <div class="record-status" :class="{ 'record-status-red': item.status.code == -1, 'record-status-green': item.status.code == 1 }">{{
          item.status.msg
        }}</div>
        <div class="record-content">
          <div class="record-header">
            <div class="record-header-item">
              <div class="record-chain">
                <img :src="getChainIcon(item.sourceChain?.chainId)" alt="" />
                <span>{{ item.sourceChain.name }}</span>
              </div>
              <div class="record-coin">-{{ item.amount }} {{ item.sourceCoin.name }}</div>
            </div>
            <img class="record-right" src="@/assets/icon_arrow_right.png" alt="" />
            <div class="record-header-item">
              <div class="record-chain">
                <img :src="getChainIcon(item.targetChain?.chainId)" alt="" />
                <span>{{ item.targetChain.name }}</span>
              </div>
              <div class="record-coin recode-coin-green">+{{ item.amount - item.fee }} {{ item.targetCoin.name }}</div>
            </div>
          </div>
          <div class="record-bottom">
            <div class="record-time">{{ item.createTime }}</div>
            <div class="record-fee">手续费: {{ item.fee }} {{ item.sourceCoin.name }}</div>
            <img src="@/assets/icon_arrow_right_1.png" alt="" />
          </div>
        </div>
      </div>
    </div>

    <nut-action-sheet v-model:visible="coinDropdownActive" title="选择币种">
      <div class="action-sheet-item" v-for="(item, index) in coinList" @click="coinChange(index)">
        <img :src="item.icon ? item.icon : coinDefaultIcon" alt="" />
        <span>{{ item.name }}</span>
      </div>
    </nut-action-sheet>

    <nut-action-sheet v-model:visible="sourceChainDropdownActive" title="选择链">
      <div class="action-sheet-item" v-for="(item, index) in allChainList" :key="item.chainId" @click="networkChange(item.chainId)">
        <img :src="getChainIcon(item.chainId)" alt="" />
        <span>{{ item.name }}</span>
      </div>
    </nut-action-sheet>

    <nut-action-sheet v-model:visible="targetChainDropdownActive" title="选择链">
      <div class="action-sheet-item" v-for="(item, index) in targetChainList" :key="item.chainId" @click="targetChainChange(index)">
        <img :src="getChainIcon(item.chainId)" alt="" />
        <span>{{ item.name }}</span>
      </div>
    </nut-action-sheet>
  </div>

  {{ getUserInfo }}
</template>

<script lang="ts" setup name="HomePage">
  import { computed } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  // import { setLang } from '@/i18n';
  // import { useI18n } from 'vue-i18n';
  import { chainList, bridgeAddressList, bridgeOrderList } from '@/api';
  import {
    useConnect,
    useChainId,
    useAccount,
    useDisconnect,
    serialize,
    useSwitchChain,
    useBalance,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
  } from '@wagmi/vue';
  import { showToast } from '@nutui/nutui';
  import '@nutui/nutui/dist/packages/toast/style/css';
  import coinDefaultIcon from '@/assets/icon_default_coin.png';
  import { bridgeAbi } from '@/abi/bridge';
  import { erc20Abi } from '@/abi/erc20';
  import router from '@/router';
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const { connectors, connect } = useConnect();
  const { address, connector, isConnected } = useAccount();
  // const { disconnect } = useDisconnect();
  // const { locale } = useI18n();
  const walletDropdownActive = ref(false);
  const networkDropdownActive = ref(false);
  const coinDropdownActive = ref(false);
  const sourceChainDropdownActive = ref(false);
  const targetChainDropdownActive = ref(false);
  const allChainList = ref<any>([]);
  const targetChainList = ref<any>([]);
  const coinList = ref<any>([]);
  const sourceChainIndex = ref(0);
  const targetChainIndex = ref(0);
  const coinIndex = ref(0);
  const coinNum = ref();
  const bridgeContractList = ref<any>([]);
  const toAccountAddress = ref<any>();
  const orderList = ref<any>([]);
  const lockApprove = ref(false);
  const lockSubmit = ref(false);
  // let cellList = ['vue3', 'vite', 'vue-router', 'axios', 'Pinia', 'vue-i18n', 'postcss-px-to-viewport', 'varlet / vant / nutUI', 'eruda'];
  const userStore = useUserStore();
  const getUserInfo = computed(() => {
    const { name = '' } = userStore.getUserInfo || {};
    return name;
  });
  const coinIcon = computed(() => {
    if (!isConnected.value || coinList.value.length == 0 || !coinList.value[coinIndex.value].icon) return coinDefaultIcon;
    return coinList.value[coinIndex.value].icon;
  });
  const coinName = computed(() => {
    if (!isConnected.value || coinList.value.length == 0) return '请选择';
    return coinList.value[coinIndex.value].name;
  });
  const feeValue = computed(() => {
    let feeObj = coinList.value[coinIndex.value]?.fee;
    return feeObj && isConnected.value ? `${feeObj.feeFixed} + ${(feeObj.feePercent / 100) * (coinNum.value ?? 0)}` : '--';
  });

  const bridgeAddress = computed(() => {
    return bridgeContractList.value.find((item) => item.chainId == chainId.value)?.bridgeAddress;
  });
  const tokenAddress = computed(() => {
    console.log(coinIndex.value);
    return coinList.value[coinIndex.value]?.type == 'native' ? undefined : coinList.value[coinIndex.value]?.address;
  });
  const tokenBalance = useBalance({
    address: address,
    token: tokenAddress,
  });

  const allowanceResult = useReadContract({
    abi: erc20Abi,
    address: coinList[coinIndex.value]?.address ?? '0x',
    functionName: 'allowance',
    args: [address.value ?? '0x', bridgeAddress],
  });

  const { data: approveHash, writeContract: approveWriteContract } = useWriteContract();

  const { isLoading: isAllowanceing, isSuccess: isAllowanceed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { data: depositHash, writeContract: depositWriteContract } = useWriteContract();

  const { isLoading: isDepositing, isSuccess: isDeposited } = useWaitForTransactionReceipt({
    hash: depositHash,
  });
  watch(isConnected, (newValue, oldValue) => {
      console.log(`isConnected 的值从 ${oldValue} 变为 ${newValue}`);
      if( newValue){
        getOrderList();
      }
      if(!newValue){
        orderList.value = []
      }
    });
  watch(address, (newValue, oldValue) => {
      console.log(`address 的值从 ${oldValue} 变为 ${newValue}`);
      // if(oldValue != undefined && newValue){
        getOrderList();
        tokenBalance.refetch();
      // }
    });
  onMounted(() => {
    document.addEventListener('click', closeDropdown);
    getChainList();
    getBridgeAddressList();
  });
  onBeforeUnmount(() => {
    document.removeEventListener('click', closeDropdown);
  });

  // const changeLang = (type) => {
  //   setLang(type);
  // };

  const closeDropdown = (event) => {
    if (!event.target.closest('.wallet-connect')) {
      walletDropdownActive.value = false;
    }
    if (!event.target.closest('.network-select')) {
      networkDropdownActive.value = false;
    }
  };

  const getChainList = () => {
    chainList().then((res) => {
      allChainList.value = res.data ?? [];
      if (allChainList.value.length == 0) return;
      sourceChainDropdownActive.value = false;
      sourceChainIndex.value = allChainList.value.findIndex((item) => item.chainId == chainId.value);
      getTargetChainList();
      getCoinList();
      if (isConnected.value) networkChange(chainId.value);
    });
  };

  const getOrderList = () => {
    bridgeOrderList(address.value).then((res) => {
      orderList.value = res.data ?? [];
    });
  };

  const getBridgeAddressList = () => {
    bridgeAddressList().then((res) => {
      bridgeContractList.value = res.data;
    });
  };

  const getTargetChainList = () => {
    targetChainIndex.value = 0;
    targetChainList.value = allChainList.value[sourceChainIndex.value]?.targetChains ?? [];
  };

  const getCoinList = () => {
    coinIndex.value = 0;
    coinList.value = targetChainList.value[targetChainIndex.value].sourceCoins;
  };
  const connectedCheck = () => {
    console.log('connectors:', connectors);
    if (!isConnected.value) {
      walletConnect(connectors.find((item) => item.id == 'injected'));
      return false;
    } else {
      return true;
    }
  };
  const submit = async () => {
    if (lockSubmit.value) return;
    if (!coinNum.value) {
      return showToast.text('请输入数量');
    }
    if (coinNum.value > (tokenBalance.data.value?.formatted ?? 0)) {
      return showToast.text('余额不足');
    }
    let feeObj = coinList.value[coinIndex.value]?.fee;
    if (coinNum.value < (feeObj.feeFixed + (feeObj.feePercent / 100) * coinNum.value)) {
      return showToast.text('输入数量不足以支付手续费');
    }
    if (!toAccountAddress.value) {
      return showToast.text('请输入收款地址');
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(toAccountAddress.value)) {
      return showToast.text('收款地址有误');
    }
    const amount = BigInt(Number(coinNum.value) * Math.pow(10, coinList.value[coinIndex.value].decimals));
    lockSubmit.value = true;
    try {
      depositWriteContract(
        {
          abi: bridgeAbi,
          address: bridgeAddress.value,
          functionName: 'Deposit',
          value: tokenAddress.value ? undefined : amount,
          args: [
            toAccountAddress.value,
            amount,
            targetChainList.value[targetChainIndex.value].chainId,
            coinList.value[coinIndex.value].address,
          ],
        },
        {
          onSettled: (res) => {
            lockSubmit.value = false;
            console.log('onSettled', res);
          },
          onError: (res) => {
            if (res.message.includes('User rejected the request.')) return showToast.text('取消支付');
            return showToast.text('交易失败，请重试');
          },
          onSuccess: (res) => {
            showToast.text('跨链提交成功');
            console.log('depositSuc:', res);
          },
        },
      );
    } catch {
      lockSubmit.value = false;
    }
  };
  const approve = () => {
    console.log('approve', isAllowanceing, lockApprove.value);
    if (isAllowanceing.value || lockApprove.value) return;
    lockApprove.value = true;
    try {
      approveWriteContract(
        {
          abi: erc20Abi,
          address: coinList.value[coinIndex.value].address,
          functionName: 'approve',
          args: [bridgeAddress.value, 1000000000000000000000000000000000000000000000n],
        },
        {
          onSettled: (_) => {
            lockApprove.value = false;
          },
          onError: (res) => {
            if (res.message.includes('User rejected the request.')) return showToast.text('取消授权');
            return showToast.text('交易失败，请重试');
          },
        },
      );
    } catch {
      lockApprove.value = false;
    }
  };

  const coinDropdownActiveChange = () => {
    if (connectedCheck()) coinDropdownActive.value = !coinDropdownActive.value;
  };
  const sourceChainDropdownActiveChange = () => {
    if (connectedCheck()) sourceChainDropdownActive.value = !sourceChainDropdownActive.value;
  };
  const targetChainDropdownActiveChange = () => {
    if (connectedCheck()) targetChainDropdownActive.value = !targetChainDropdownActive.value;
  };

  const getChainIcon = (chainId) => {
    let icon = allChainList.value.find((item) => item.chainId == chainId)?.icon;
    return icon && isConnected.value ? icon : coinDefaultIcon;
  };
  const getChainName = (chainId) => {
    if (!isConnected.value) return '请选择';
    if (allChainList.value.length == 0) return '请选择';
    return allChainList.value.find((item) => item.chainId == chainId)?.name;
  };

  const walletConnect = (connector) => {
    if (typeof window.ethereum === 'undefined') {
      // 如果 window.ethereum 未定义，说明用户未安装 MetaMask
      showToast.text('请先安装 MetaMask');
    } else {
      connect(
        { connector, chainId: chainId.value },
        {
          onSuccess: () => {
            coinDropdownActive.value = sourceChainDropdownActive.value = targetChainDropdownActive.value = false;
            networkChange(chainId.value);
          },
        },
      );
    }
  };

  // const walletDisconnect = () => {
  //   isConnected.value = false;
  //   walletDropdownActive.value = false;

  // }

  const networkChange = (id) => {
    const _chain = chains.value.find((item) => item.id == id);
    if (!_chain) {
      showToast.text('暂未支持此网络');
      return;
    }
    if (!isConnected.value) {
      walletConnect(connectors.find((item) => item.id == 'injected'));
      return;
    }
    switchChain(
      { chainId: _chain?.id },
      {
        onSuccess: () => {
          console.log('切换网络成功');
          sourceChainDropdownActive.value = false;
          sourceChainIndex.value = allChainList.value.findIndex((item) => item.chainId == id);
          getTargetChainList();
          getCoinList();
        },
        onError: (error) => {
          console.log('切换网络失败', error.message);
        },
      },
    );
  };

  const coinChange = (index) => {
    coinDropdownActive.value = false;
    coinIndex.value = index;
    console.log(tokenAddress.value);
  };

  const walletDropdown = () => {
    walletDropdownActive.value = !walletDropdownActive.value;
  };
  const networkDropdown = () => {
    networkDropdownActive.value = !networkDropdownActive.value;
  };
  const targetChainChange = (index) => {
    targetChainDropdownActive.value = false;
    targetChainIndex.value = index;
    getCoinList();
  };
  const copyText = (text) => {
    // 复制输入框中的文本
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast.text('复制成功');
      })
      .catch((_) => {
        showToast.text('复制失败');
      });
  };
  ///根据链id，打开区块链浏览器
  const openExplorer = () => {
    let url = '';
    switch (chainId.value) {
      case 1:
        url = `https://etherscan.io/address/${address.value}`;
        break;
      case 56:
        url = `https://bscscan.com/address/${address.value}`;
        break;
      case 42161:
        url = `https://arbiscan.io/address/${address.value}`;
        break;
      case 878:
        url = `https://kadscan.kadsea.org/address/${address.value}`;
        break;
      case 97:
        url = `https://testnet.bscscan.com/address/${address.value}`;
        break;
      default:
        break;
    }
    walletDropdownActive.value = false;
    window.open(url, '_blank');
  };
  const toDetail = (item) => {
    router.push({ path: '/order/detail', query: { orderId: item.orderId } });
  };
</script>
<style lang="scss">
  .flex-1 {
    flex: 1;
  }

  .home-page {
    display: flex;
    flex-direction: column;
    min-height: 100%;

    input {
      padding: 0;
      border: none;
      outline: none;
      background: none;
      color: #000;
      font-size: 16px;
    }

    input::placeholder {
      color: #9da9c4;
      font-size: 14px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 44px;
      padding: 10px 15px 0;

      .logo {
        width: 80px;
        height: 20px;
      }

      .wallet-connect {
        position: relative;
        width: 112px;
        height: 28px;
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
          font-size: 14px;
          font-weight: 400;

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
              font-size: 12px;
              font-weight: 400;
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
          height: 28px;
          border: 1px solid #1b1a3b;
          border-radius: 14px;
          background: #f5f8ff;
          font-weight: 400;

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
          min-width: 112px;
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
            font-size: 12px;
            font-weight: 400;
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
    }

    .form {
      padding: 20px 15px 30px;

      .form-item {
        margin-bottom: 24px;

        .item-title {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #9da9c4;
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: 12px;
          text-align: left;

          .balance {
            color: #0049e7;
          }
        }

        .input-number {
          display: flex;
          justify-content: space-between;
          height: 50px;
          border-radius: 14px;
          background: #fff;

          .coin-drop-down {
            display: flex;
            align-items: center;
            padding: 0 15px;
            font-weight: 500;
            cursor: pointer;

            .coin-img {
              width: 30px;
              height: 30px;
              border-radius: 30px;
            }

            .coin-name {
              margin: 0 10px 0 8px;
              color: #000;
              font-size: 16px;
              white-space: nowrap;
            }

            .coin-arrow {
              width: 12px;
              height: 12px;
            }
          }

          input {
            width: 100%;
            padding-right: 15px;
            text-align: right;
          }
        }

        .chain-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 14px;

          .chain-drop-down {
            display: flex;
            flex: 1;
            align-items: center;
            width: 1px;
            height: 50px;
            padding: 0 15px;
            border-radius: 14px;
            background: #fff;
            cursor: pointer;

            .chain-img {
              width: 30px;
              height: 30px;
              border-radius: 30px;
            }

            .chain-name {
              margin: 0 8px;
              overflow: hidden;
              color: #000;
              font-size: 16px;
              font-weight: 500;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .chain-arrow {
              width: 12px;
              height: 12px;
            }
          }

          .chain-right {
            width: 20px;
            height: 20px;
            padding: 0 14px;
          }
        }

        .input-address {
          width: calc(100% - 32px);
          height: 50px;
          padding: 0 16px;
          border-radius: 14px;
          background: #fff;
          font-size: 16px;

          &::placeholder {
            font-size: 16px;
          }
        }

        .fee-wrapper {
          height: 50px;
          padding: 0 16px;
          border-radius: 14px;
          background: #fff;
          color: #000;
          font-size: 16px;
          font-weight: 500;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
      }

      .submit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 50px;
        border-radius: 14px;
        background: linear-gradient(to bottom right, #0049e7 0%, #c835f8 100%);
        color: #fff;
        font-size: 16px;
        font-weight: 400;
        text-align: center;
        cursor: pointer;
      }
    }

    .record-wrapper {
      flex: 1;
      padding: 15px;
      padding-bottom: 18px;
      border-radius: 16px;
      background: #fff;

      .record-title {
        margin-bottom: 18px;
        color: #000e2b;
        font-size: 18px;
        font-weight: 500;
        text-align: left;
      }

      .record-item {
        position: relative;
        margin-bottom: 20px;
        padding-top: 24px;
        cursor: pointer;

        .record-status {
          position: absolute;
          z-index: 1;
          top: 0;
          right: 0;
          min-width: 50px;
          height: 40px;
          padding: 0 12px;
          border-radius: 10px 10px 0;
          background: rgb(247 177 28 / 10%);
          color: #f7b11c;
          font-size: 12px;
          font-weight: 400;
          line-height: 24px;
          text-align: center;

          &.record-status-red {
            background: rgb(234 75 75 / 10%);
            color: rgb(234 75 75 / 100%);
          }

          &.record-status-green {
            background: rgb(47 185 59 / 10%);
            color: rgb(47 185 59 / 100%);
          }
        }

        .record-content {
          position: relative;
          z-index: 2;
          padding: 8px 10px;
          border-radius: 14px;
          background: #f5f8ff;

          .record-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;

            .record-header-item {
              flex: 1;
              width: 1px;
              padding: 10px;
              border-radius: 10px;
              background: #fff;
              word-wrap: break-word;

              .record-chain {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                margin-bottom: 10px;
                color: #000;
                font-size: 14px;
                font-weight: 400;
                line-height: 14px;

                img {
                  width: 20px;
                  height: 20px;
                  margin-right: 6px;
                  border-radius: 20px;
                }
              }

              .record-coin {
                color: #ea4b4b;
                font-size: 12px;
                font-weight: 400;
                line-height: 12px;

                &.recode-coin-green {
                  color: #2fb93b;
                }
              }
            }

            .record-right {
              width: 14px;
              height: 14px;
              margin: 0 28px;
            }
          }

          .record-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #9da9c4;
            font-size: 12px;
            font-weight: 400;
            line-height: 20px;

            .record-fee {
              flex: 1;
              text-align: right;
            }

            img {
              width: 20px;
              height: 20px;
              margin-left: 6px;
            }
          }
        }
      }
    }

    .action-sheet-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: 50px;
      padding: 0 15px;
      border-bottom: 1px solid rgb(27 26 59 / 10%);
      background: #fff;
      color: #1b1a3b;
      font-size: 14px;
      font-weight: 400;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      img {
        width: 30px;
        height: 30px;
        margin-right: 8px;
        border-radius: 30px;
      }
    }
  }
</style>