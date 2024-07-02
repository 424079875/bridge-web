<template>
  <div class="home-page">
    <div class="header">
      <!-- <img class="logo" src="@/assets/icon_logo.png" alt="" /> -->
      <div class="flex-1"></div>
      <!-- <button
    v-for="connector in connectors"
    @click="connect({ connector, chainId })"
  >
    {{ connector.name }}
  </button> -->
      <div class="lang-select">
        <div class="lang-select-btn">
          <img src="@/assets/icon_lang.png" alt="" @click="langDropdownActive = !langDropdownActive" />
        </div>
        <div class="lang-dropdown" v-show="langDropdownActive">
          <div class="lang-dropdown-item" v-for="lang in langList" :key="lang.value" @click="changeLang(lang.value)">
            <span>{{ lang.label }}</span>
          </div>
        </div>
      </div>
      <div> </div>
      <div class="wallet-connect">
        <div class="wallet-connect-btn" v-if="!isConnected" @click="walletConnect()">{{ $t('home.connectWallet') }}</div>
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
              <span>{{ $t('home.copyAaddress') }}</span>
            </div>
            <div class="wallet-dropdown-item" @click="openExplorer()">
              <img src="@/assets/icon_browser.png" alt="" />
              <span>{{ $t('home.browserView') }}</span>
            </div>
            <div class="wallet-dropdown-item" @click="walletDisconnect()">
              <img src="@/assets/icon_disconnect.png" alt="" />
              <span>{{ $t('home.disconnect') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="network-select" v-if="isConnected">
        <div class="network-select-btn" @click="networkDropdown">
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
          <span>{{ $t('home.selectCrossChainAssets') }}</span>
          <span v-if="isConnected"
            >{{ $t('home.balance') }}：<span class="balance">{{ tokenBalance?.data?.value?.formatted ?? '--' }}</span></span
          >
        </div>
        <div class="input-number">
          <div class="coin-drop-down" @click="coinDropdownActiveChange()">
            <img class="coin-img" :src="coinIcon" alt="" />
            <span class="coin-name">{{ coinName }}</span>
            <img class="coin-arrow" src="@/assets/icon_arrow_down.png" alt="" />
          </div>
          <input type="text" v-model="coinNum" maxlength="18" :placeholder="$t('home.inputQuantity')" />
        </div>
      </div>

      <div class="form-item">
        <div class="item-title">
          <span>{{ $t('home.transferOutChain') }}</span>
        </div>
        <div class="chain-wrapper">
          <div class="chain-drop-down" @click="sourceChainDropdownActiveChange()">
            <img class="chain-img" :src="getChainIcon(allChainList[sourceChainIndex]?.chainId)" alt="" />
            <span class="chain-name">{{ getChainName(allChainList[sourceChainIndex]?.name) }}</span>
            <img class="chain-arrow" src="@/assets/icon_arrow_down_1.png" alt="" />
          </div>
          <img class="chain-right" src="@/assets/icon_arrow_right.png" alt="" />
          <div class="chain-drop-down" @click="targetChainDropdownActiveChange()">
            <img class="chain-img" :src="getChainIcon(targetChainList[targetChainIndex]?.chainId)" alt="" />
            <span class="chain-name">{{ getChainName(targetChainList[targetChainIndex]?.name) }}</span>
            <img class="chain-arrow" src="@/assets/icon_arrow_down_1.png" alt="" />
          </div>
        </div>
      </div>

      <div class="form-item">
        <div class="item-title">
          <span>{{ $t('home.paymentAddress') }}</span>
        </div>
        <input type="text" class="input-address" v-model="toAccountAddress" :placeholder="$t('home.pleaseEnterThepaymentAddress')" />
      </div>

      <div class="form-item" style="margin-bottom: 12px">
        <div class="item-title">
          <span>{{ $t('home.fee') }}</span>
        </div>
        <div class="fee-wrapper">{{ feeValue }} {{ coinList[coinIndex]?.name ?? '' }}</div>
      </div>
      <div class="form-item" style="margin-bottom: 0" v-if="sourceChainId == 878 || targetChainList[targetChainIndex]?.chainId == 878">
        <div class="item-title">
          <span>{{ sourceChainId == 878 ? $t('home.KusdTransferOutTips') : $t('home.KusdTransferInTips') }}</span>
        </div>
      </div>
      <div style="height: 18px"></div>
      <div class="submit-button" @click="walletConnect()" v-if="!isConnected">{{ $t('home.connectWallet') }}</div>
      <div class="submit-button" @click="networkChange(sourceChainId)" v-else-if="accountChainId != sourceChainId"
        >{{ $t('home.switchTo') }} {{ allChainList[sourceChainIndex]?.name }}</div
      >
      <div
        class="submit-button opacity-4"
        v-else-if="
          tokenBalance?.data?.value?.formatted == '0' || parseFloat(coinNum) > parseFloat(tokenBalance?.data?.value?.formatted ?? 0)
        "
        >{{ $t('home.insufficientBalance') }}</div
      >
      <div
        class="submit-button"
        :class="{ 'opacity-4': !coinNum }"
        @click="approve()"
        v-else-if="
          (!allowanceResult.data.value && !isAllowanceed && tokenAddress) ||
          allowanceResult.data.value! < coinNum * 10 ** coinList[coinIndex]?.decimals
        "
        >{{ isAllowanceing || refetchAllowance ? `${$t('home.Approveing')}...` : $t('home.Approve') }}</div
      >
      <div class="submit-button" @click="submit()" v-else>{{ $t('home.confirm') }}</div>
    </div>

    <div class="record-wrapper">
      <div class="record-title">
        <span style="margin-right: 8px">{{ $t('home.crossChainRecords') }}</span>
        <nut-popover
          style="width: 200px"
          v-model:visible="showOrderTips"
          :list="[{ name: $t('home.crossChainRecordsTips') }]"
          theme="dark"
          location="top"
        >
          <template style="display: flex" #reference>
            <Issue name="issue" />
          </template>
        </nut-popover>
      </div>
      <nut-empty :description="$t('home.noData')" v-if="orderList.length == 0" />
      <div class="record-item" v-for="item in orderList" :key="item.orderId" @click="toDetail(item)">
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
              <div class="record-coin recode-coin-green">+{{ formatNumber(item.amount - item.fee) }} {{ item.targetCoin.name }}</div>
            </div>
          </div>
          <div class="record-bottom">
            <div class="record-time">{{ item.createTime }}</div>
            <div class="record-fee">{{ $t('home.fee') }}: {{ item.fee }} {{ item.sourceCoin.name }}</div>
            <img src="@/assets/icon_arrow_right_1.png" alt="" />
          </div>
        </div>
      </div>
    </div>

    <nut-action-sheet v-model:visible="coinDropdownActive" :title="$t('home.selectCurrency')">
      <div class="action-sheet-item" v-for="(item, index) in coinList" :key="index" @click="coinChange(index)">
        <img :src="item.icon ? item.icon : coinDefaultIcon" alt="" />
        <span>{{ item.symbol }}</span>
      </div>
    </nut-action-sheet>

    <nut-action-sheet v-model:visible="sourceChainDropdownActive" :title="$t('home.selectChain')">
      <div class="action-sheet-item" v-for="(item, index) in allChainList" :key="item.chainId" @click="sourceChainChange(index)">
        <img :src="getChainIcon(item.chainId)" alt="" />
        <span>{{ item.name }}</span>
      </div>
    </nut-action-sheet>

    <nut-action-sheet v-model:visible="targetChainDropdownActive" :title="$t('home.selectChain')">
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
  import { Issue } from '@nutui/icons-vue';
  import { setLang, loadLang, i18n } from '@/i18n';
  import { chainList, bridgeAddressList, bridgeOrderList } from '@/api';
  import {
    useConnect,
    useChainId,
    useAccount,
    useSwitchChain,
    useBalance,
    useReconnect,
    useDisconnect,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
  } from '@wagmi/vue';
  import { injected } from '@wagmi/vue/connectors';
  import { showToast } from '@nutui/nutui';
  import '@nutui/nutui/dist/packages/toast/style/css';
  import coinDefaultIcon from '@/assets/icon_default_coin.png';
  import { bridgeAbi } from '@/abi/bridge';
  import { erc20Abi } from '@/abi/erc20';
  import { ethUsdtAbi } from '@/abi/ethUsdt';
  import router from '@/router';

  const showOrderTips = ref(false);
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();
  const { connect } = useConnect();
  const { address, isConnected, chainId: accountChainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { reconnect } = useReconnect();
  const langDropdownActive = ref(false);
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
  const chainIconConfig = ref();
  const lockApprove = ref(false);
  const lockSubmit = ref(false);
  const refetchAllowance = ref(false);
  let orderListRequests = 0;
  // let cellList = ['vue3', 'vite', 'vue-router', 'axios', 'Pinia', 'vue-i18n', 'postcss-px-to-viewport', 'varlet / vant / nutUI', 'eruda'];
  const userStore = useUserStore();
  const injectedConfig = injected({
    shimDisconnect: false,
  });
  const langList = ref([
    { label: '简体中文', value: 'zh-cn' },
    { label: 'English', value: 'en-us' },
    { label: 'Bahasa Indonesia', value: 'id' },
    { label: 'Tiếng Việt', value: 'vi' },
  ]);
  const getUserInfo = computed(() => {
    const { name = '' } = userStore.getUserInfo || {};
    return name;
  });
  const coinIcon = computed(() => {
    if (coinList.value.length == 0 || !coinList.value[coinIndex.value].icon) return coinDefaultIcon;
    return coinList.value[coinIndex.value].icon;
  });
  const coinName = computed(() => {
    if (coinList.value.length == 0) return loadLang()[i18n.global.locale.value].home.pleaseChoose;
    return coinList.value[coinIndex.value].symbol;
  });
  const feeValue = computed(() => {
    let feeObj = coinList.value[coinIndex.value]?.fee;
    return feeObj
      ? `${feeObj.feeFixed} + ${formatNumber((feeObj.feePercent * 1000000 * ((coinNum.value ?? 0) * 1000000)) / 100000000000000)}`
      : '--';
  });

  const bridgeAddress = computed(() => {
    return bridgeContractList.value.find((item) => item.chainId == chainId.value)?.bridgeAddress;
  });
  const tokenAddress = computed(() => {
    return coinList.value[coinIndex.value]?.type == 'native' ? undefined : coinList.value[coinIndex.value]?.address;
  });
  const sourceChainId = computed(() => {
    const id = allChainList.value ? Number(allChainList?.value[sourceChainIndex.value]?.chainId) : undefined;
    return id;
  });
  const isEthUsdt = computed(() => {
    return chainId.value == 1 && coinList.value[coinIndex.value].address == '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  });

  const tokenBalance = useBalance({
    address: address,
    token: tokenAddress,
    chainId: sourceChainId,
  });

  const allowanceResult = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'allowance',
    args: [address as any, bridgeAddress],
  });

  const { data: approveHash, writeContract: approveWriteContract } = useWriteContract();

  const { isLoading: isAllowanceing, isSuccess: isAllowanceed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { writeContract: depositWriteContract } = useWriteContract();

  watch(isConnected, (newValue, oldValue) => {
    console.log(`isConnected 的值从 ${oldValue} 变为 ${newValue}`);
    if (newValue) {
      getOrderList();
    }
    if (!newValue) {
      orderList.value = [];
    }
  });
  watch(address, (newValue, oldValue) => {
    console.log(`address 的值从 ${oldValue} 变为 ${newValue}`);
    if (oldValue != undefined && newValue) {
      getOrderList();
    }
    tokenBalance.refetch();
    allowanceResult.refetch();
  });

  watch(isAllowanceed, (newValue, oldValue) => {
    console.log(`isAllowanceed 的值从 ${oldValue} 变为 ${newValue}`);
    if (newValue) {
      refetchAllowance.value = true;
      let _cycle = 0;
      const _address = address.value;
      const _tokenAddress = tokenAddress.value;
      const _bridgeAddress = bridgeAddress.value;
      let allowanceTimer = setInterval(() => {
        if (
          !allowanceResult.data.value &&
          _address == address.value &&
          _tokenAddress == tokenAddress.value &&
          _bridgeAddress == bridgeAddress.value &&
          _cycle < 30
        ) {
          _cycle++;
          allowanceResult.refetch();
        } else {
          refetchAllowance.value = false;
          clearInterval(allowanceTimer);
        }
      }, 1000);
    }
  });
  watch(coinNum, (newValue, oldValue) => {
    const regex = /^(?=.*[1-9])\d*(\.\d*)?$/;
    if (!newValue || /^(0(\.\d*)?|0?\.\d+)$/.test(newValue)) return;
    if (!regex.test(newValue)) coinNum.value = oldValue;
  });
  onMounted(() => {
    console.log('navigator.userAgent', navigator.userAgent);
    document.addEventListener('click', closeDropdown);
    if (isConnected.value && orderListRequests == 0) getOrderList();
    getChainList();
    getBridgeAddressList();
    setTimeout(() => {
      if (window.ethereum.address && !address.value) {
        walletConnect();
      }
    }, 200);
  });
  onBeforeUnmount(() => {
    document.removeEventListener('click', closeDropdown);
  });

  const changeLang = (type) => {
    setLang(type);
    langDropdownActive.value = false;
    getOrderList();
  };

  const closeDropdown = (event) => {
    if (!event.target.closest('.lang-select')) {
      langDropdownActive.value = false;
    }
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
      const _sourceChainId = localStorage.getItem('sourceChainId');
      if (_sourceChainId) {
        let index = allChainList.value.findIndex((item) => item.chainId == JSON.parse(_sourceChainId));
        sourceChainIndex.value = index == -1 ? 0 : index;
      }
      allChainList.value.forEach((item) => {
        chainIconConfig[item.chainId] = item.icon;
        item.targetChains.forEach((targetItem) => {
          chainIconConfig[targetItem.chainId] = targetItem.icon;
        });
      });
      getTargetChainList();
      getCoinList();
    });
  };

  const getOrderList = () => {
    orderListRequests++;
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
    coinList.value = targetChainList.value[targetChainIndex.value]?.sourceCoins ?? [];
  };
  const submit = async () => {
    if (lockSubmit.value) return;
    if (!coinNum.value) {
      return showToast.text(loadLang()[i18n.global.locale.value].home.inputQuantity);
    }
    if (Number(coinNum.value) > Number(tokenBalance.data.value?.formatted ?? 0)) {
      return showToast.text(loadLang()[i18n.global.locale.value].home.insufficientBalance);
    }
    let feeObj = coinList.value[coinIndex.value]?.fee;
    if (coinNum.value < feeObj.feeFixed + (feeObj.feePercent / 100) * coinNum.value) {
      return showToast.text(loadLang()[i18n.global.locale.value].home.submitTips);
    }
    if (!toAccountAddress.value) {
      return showToast.text(loadLang()[i18n.global.locale.value].home.pleaseEnterThepaymentAddress);
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(toAccountAddress.value)) {
      return showToast.text(loadLang()[i18n.global.locale.value].home.addressError);
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
          onSettled: () => {
            lockSubmit.value = false;
          },
          onError: (res) => {
            if (res.message.includes('User rejected the request') || res.message.includes('User denied transaction'))
              return showToast.text(loadLang()[i18n.global.locale.value].home.cancelPayment);
            console.log('onError', res);
            return showToast.text(loadLang()[i18n.global.locale.value].home.transactionFailed);
          },
          onSuccess: (res) => {
            showToast.text(loadLang()[i18n.global.locale.value].home.submitSuccessful);
            console.log('depositSuc:', res);
          },
        },
      );
    } catch {
      lockSubmit.value = false;
    }
  };
  const approve = () => {
    if (isAllowanceing.value || lockApprove.value || !coinNum.value || refetchAllowance.value) return;
    lockApprove.value = true;
    try {
      approveWriteContract(
        {
          abi: isEthUsdt.value ? ethUsdtAbi : erc20Abi, ///eth-usdt abi返回格式与其他erc20不一样
          address: coinList.value[coinIndex.value].address,
          functionName: 'approve',
          args: [bridgeAddress.value, tokenBalance?.data?.value?.value ?? 10000000000000000000000000000000n],
        },
        {
          onSettled: (_) => {
            lockApprove.value = false;
          },
          onError: (res) => {
            /// 取消授权
            if (res.message.includes('User rejected the request') || res.message.includes('User denied transaction'))
              return showToast.text(loadLang()[i18n.global.locale.value].home.cancelApprove);
            console.log('approveErr:', res);
            /// 交易失败
            return showToast.text(loadLang()[i18n.global.locale.value].home.ApproveFailed);
          },
        },
      );
    } catch {
      lockApprove.value = false;
    }
  };

  const coinDropdownActiveChange = () => {
    coinDropdownActive.value = !coinDropdownActive.value;
  };
  const sourceChainDropdownActiveChange = () => {
    sourceChainDropdownActive.value = !sourceChainDropdownActive.value;
  };
  const targetChainDropdownActiveChange = () => {
    targetChainDropdownActive.value = !targetChainDropdownActive.value;
  };

  const getChainIcon = (chainId) => {
    let icon = chainIconConfig[chainId];
    return icon && icon != null ? icon : coinDefaultIcon;
  };
  const getChainName = (name) => {
    return name ?? loadLang()[i18n.global.locale.value].home.pleaseChoose;
    // return allChainList.value.find((item) => item.chainId == chainId)?.name;
  };

  const walletConnect = () => {
    if (typeof window.ethereum === 'undefined') {
      // 如果 window.ethereum 未定义，说明用户未安装 MetaMask
      showToast.text(`${loadLang()[i18n.global.locale.value].home.pleaseInstallFirst} MetaMask`);
    } else {
      connect(
        { connector: injectedConfig },
        {
          onSuccess: () => {
            coinDropdownActive.value = sourceChainDropdownActive.value = targetChainDropdownActive.value = false;
          },
          onError: (error) => {
            console.log(error);
            reconnect();
          },
        },
      );
    }
  };

  const walletDisconnect = () => {
    disconnect(
      {},
      {
        onSuccess: () => {
          console.log('断开连接成功');
          if (isConnected.value) walletDisconnect();
        },
        onError: (error) => {
          console.log(error);
        },
      },
    );
    walletDropdownActive.value = false;
  };

  const networkChange = (id) => {
    const _chain = chains.value.find((item) => item.id == id);
    if (!_chain) {
      showToast.text(loadLang()[i18n.global.locale.value].home.notSupportNetwork);
      return;
    }
    if (!isConnected.value) {
      walletConnect();
      return;
    }
    switchChain(
      { chainId: _chain?.id },
      {
        onSuccess: () => {
          console.log('切换网络成功');
          networkDropdownActive.value = sourceChainDropdownActive.value = false;
          const index = allChainList.value.findIndex((item) => item.chainId == id);
          sourceChainChange(index);
          allowanceResult.refetch();
        },
        onError: (error) => {
          showToast.text(`_chain?.id: ${_chain?.id}`);
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
  const sourceChainChange = (index) => {
    sourceChainDropdownActive.value = false;
    sourceChainIndex.value = index;
    localStorage.setItem('sourceChainId', JSON.stringify(sourceChainId.value));
    getTargetChainList();
    getCoinList();
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
        showToast.text(loadLang()[i18n.global.locale.value].home.copySuccess);
      })
      .catch((_) => {
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.setAttribute('value', text);
        input.select();
        if (document.execCommand('copy')) {
          document.execCommand('copy');
        }
        document.body.removeChild(input);
        showToast.text(loadLang()[i18n.global.locale.value].home.copySuccess);
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
  const formatNumber = (number: number | string): string => {
    // 将输入转换为数字
    number = parseFloat(number.toString());

    // 如果是科学计数法的数字，则将其转换为非科学计数法的字符串
    if (Math.abs(number) >= 1e21 || (Math.abs(number) > 0 && Math.abs(number) < 1e-6)) {
      return number.toFixed(20).replace(/\.?0+$/, ''); // 使用固定位数的小数点表示法，并去除尾部的0
    }

    // 将数字转换为字符串
    const parsedNumberString = number.toString();

    // 判断是否存在小数点
    const decimalIndex = parsedNumberString.indexOf('.');
    if (decimalIndex === -1) {
      // 如果不存在小数点，则直接返回原字符串
      return parsedNumberString;
    }

    // 小数点后的位数
    const decimalPlaces = parsedNumberString.length - decimalIndex - 1;

    // 如果小数点后的位数小于等于两位，则直接返回原字符串
    if (decimalPlaces <= 2) {
      return parsedNumberString;
    }

    // 对于小于1的数字，保留小数点后第一个非0的两位小数且不四舍五入
    if (number < 1) {
      const decimalPart = parsedNumberString.substring(decimalIndex + 1);
      const nonZeroIndex = decimalPart.search(/[^0]/); // 找到第一个非0的索引
      return parsedNumberString.slice(0, decimalIndex + nonZeroIndex + 3);
    }

    // 对于大于等于1的数字，保留小数点两位不四舍五入
    return parsedNumberString.slice(0, decimalIndex + 3);
  };
</script>
<style lang="scss">
  .flex-1 {
    flex: 1;
  }

  .opacity-4 {
    opacity: 0.4;
  }

  .nut-popover-wrapper {
    display: flex;
  }

  .nut-popover-content--top {
    width: 200px;
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
          margin: 4px auto 0;
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
            font-size: 12px;
            font-weight: 400;
            line-height: 1;

            &:last-child {
              border-bottom: none;
            }
          }
        }
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
              font-size: 14px;
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
            padding: 0 14px;
            border-radius: 14px;
            background: #fff;
            cursor: pointer;

            .chain-img {
              width: 28px;
              height: 28px;
              border-radius: 30px;
            }

            .chain-name {
              margin: 0 8px;
              overflow: hidden;
              color: #000;
              font-size: 12px;
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
          display: flex;
          align-items: center;
          height: 50px;
          padding: 0 16px;
          overflow: hidden;
          border-radius: 14px;
          background: #fff;
          color: #000;
          font-size: 16px;
          font-weight: 500;
        }
      }

      .submit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 50px;
        border-radius: 14px;
        // background: linear-gradient(to bottom, #26DDA6 0%, #4EFFCA 100%);
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
        display: flex;
        align-items: center;
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
