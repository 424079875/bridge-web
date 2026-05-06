<template>
  <Header
    :langDropdownActive="langDropdownActive"
    :walletDropdownActive="walletDropdownActive"
    :networkDropdownActive="networkDropdownActive"
    :langList="langList"
    :isConnected="isConnected"
    :address="address"
    :addressShort="address?.toString().replace(/^(.{6}).*(.{4})$/, '$1...$2')"
    :connectWalletText="$t('home.connectWallet')"
    :copyAaddressText="$t('home.copyAaddress')"
    :browserViewText="$t('home.browserView')"
    :disconnectText="$t('home.disconnect')"
    :networkIcon="
      getChainIcon(
        sourceChainId == -1 ? allChainList[sourceChainIndex].chainId : chainId,
      )
    "
    :allChainList="allChainList"
    :getChainIcon="getChainIcon"
    @toggle-lang-dropdown="langDropdownActive = !langDropdownActive"
    @change-lang="changeLang"
    @wallet-connect="walletConnect"
    @wallet-dropdown="walletDropdown"
    @copy-text="copyText"
    @open-explorer="openExplorer"
    @wallet-disconnect="walletDisconnect"
    @network-dropdown="networkDropdown"
    @network-change="networkChange"
  />
  <div class="home-page" style="padding-top: 60px">
    <div class="form">
      <div class="form-item">
        <div class="item-title">
          <span>{{ $t("home.selectCrossChainAssets") }}</span>
          <span v-if="isConnected"
            >{{ $t("home.balance") }}：<span class="balance">{{
              tokenBalance ?? "--"
            }}</span></span
          >
        </div>
        <div class="input-number">
          <div class="coin-drop-down" @click="coinDropdownActiveChange()">
            <img class="coin-img" :src="coinIcon" alt="" />
            <span class="coin-name">{{ coinName }}</span>
            <img class="coin-arrow" src="@/assets/icon_arrow_down.png" alt="" />
          </div>
          <input
            type="text"
            v-model="coinNum"
            maxlength="18"
            :placeholder="$t('home.inputQuantity')"
          />
        </div>
      </div>

      <div class="form-item">
        <div class="item-title">
          <span>{{ $t("home.transferOutChain") }}</span>
        </div>
        <div class="chain-wrapper">
          <div
            class="chain-drop-down"
            @click="sourceChainDropdownActiveChange()"
          >
            <img
              class="chain-img"
              :src="getChainIcon(allChainList[sourceChainIndex]?.chainId)"
              alt=""
            />
            <span class="chain-name">{{
              getChainName(allChainList[sourceChainIndex]?.name)
            }}</span>
            <img
              class="chain-arrow"
              src="@/assets/icon_arrow_down_1.png"
              alt=""
            />
          </div>
          <img class="chain-right" src="@/assets/icon_arrow_right.png" alt="" />
          <div
            class="chain-drop-down"
            @click="targetChainDropdownActiveChange()"
          >
            <img
              class="chain-img"
              :src="getChainIcon(targetChainList[targetChainIndex]?.chainId)"
              alt=""
            />
            <span class="chain-name">{{
              getChainName(targetChainList[targetChainIndex]?.name)
            }}</span>
            <img
              class="chain-arrow"
              src="@/assets/icon_arrow_down_1.png"
              alt=""
            />
          </div>
        </div>
      </div>

      <div class="form-item">
        <div class="item-title">
          <span>{{ $t("home.paymentAddress") }}</span>
        </div>
        <input
          type="text"
          class="input-address"
          v-model="toAccountAddress"
          :placeholder="$t('home.pleaseEnterThepaymentAddress')"
        />
      </div>

      <div class="form-item" style="margin-bottom: 12px">
        <div class="item-title">
          <span>{{ $t("home.fee") }}</span>
        </div>
        <div class="fee-wrapper">
          {{ feeValue }} {{ coinList[coinIndex]?.name ?? "" }}
        </div>
      </div>
      <div
        class="form-item"
        style="margin-bottom: 0"
        v-if="
          sourceChainId == 878 ||
          targetChainList[targetChainIndex]?.chainId == 878
        "
      >
        <div class="item-title">
          <span>{{
            sourceChainId == 878
              ? $t("home.KusdTransferOutTips")
              : $t("home.KusdTransferInTips")
          }}</span>
        </div>
      </div>
      <div style="height: 18px"></div>
      <div class="submit-button" @click="walletConnect()" v-if="!isConnected">
        {{ $t("home.connectWallet") }}
      </div>
      <div
        class="submit-button"
        @click="networkChange(sourceChainId)"
        v-else-if="sourceChainId != -1 && accountChainId != sourceChainId"
      >
        {{ $t("home.switchTo") }} {{ allChainList[sourceChainIndex]?.name }}
      </div>

      <div
        class="submit-button opacity-4"
        v-else-if="
          tokenBalance == '0' ||
          parseFloat(coinNum) > parseFloat(tokenBalance ?? 0)
        "
      >
        {{ $t("home.insufficientBalance") }}
      </div>
      <div
        class="submit-button"
        :class="{ 'opacity-4': !coinNum }"
        @click="approve()"
        v-else-if="
          sourceChainId == -1 &&
          tokenAddress &&
          (!tronAllowance || tronAllowance < coinNum)
        "
      >
        {{ lockApprove ? `${$t("home.Approveing")}...` : $t("home.Approve") }}
      </div>
      <div
        class="submit-button"
        :class="{ 'opacity-4': !coinNum }"
        @click="approve()"
        v-else-if="
          (sourceChainId != -1 &&
            !allowanceResult.data.value &&
            !isAllowanceed &&
            tokenAddress) ||
          allowanceResult.data.value! <
            coinNum * 10 ** coinList[coinIndex]?.decimals
        "
      >
        {{
          isAllowanceing || refetchAllowance
            ? `${$t("home.Approveing")}...`
            : $t("home.Approve")
        }}
      </div>
      <div class="submit-button" @click="submit()" v-else>
        {{ $t("home.confirm") }}
      </div>
    </div>

    <div class="record-wrapper">
      <div class="record-title">
        <span style="margin-right: 8px">{{
          $t("home.crossChainRecords")
        }}</span>
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
      <nut-empty
        :description="$t('home.noData')"
        v-if="orderList.length == 0"
      />
      <div
        class="record-item"
        v-for="item in orderList"
        :key="item.orderId"
        @click="toDetail(item)"
      >
        <div
          class="record-status"
          :class="{
            'record-status-red': item.status.code == -1,
            'record-status-green': item.status.code == 1,
          }"
        >
          {{ item.status.msg }}
        </div>
        <div class="record-content">
          <div class="record-header">
            <div class="record-header-item">
              <div class="record-chain">
                <img :src="getChainIcon(item.sourceChain?.chainId)" alt="" />
                <span>{{ item.sourceChain.name }}</span>
              </div>
              <div class="record-coin">
                -{{ item.amount }} {{ item.sourceCoin.name }}
              </div>
            </div>
            <img
              class="record-right"
              src="@/assets/icon_arrow_right.png"
              alt=""
            />
            <div class="record-header-item">
              <div class="record-chain">
                <img :src="getChainIcon(item.targetChain?.chainId)" alt="" />
                <span>{{ item.targetChain.name }}</span>
              </div>
              <div class="record-coin recode-coin-green">
                +{{ formatNumber(item.amount - item.fee) }}
                {{ item.targetCoin.name }}
              </div>
            </div>
          </div>
          <div class="record-bottom">
            <div class="record-time">{{ item.createTime }}</div>
            <div class="record-fee">
              {{ $t("home.fee") }}: {{ item.fee }} {{ item.sourceCoin.name }}
            </div>
            <img src="@/assets/icon_arrow_right_1.png" alt="" />
          </div>
        </div>
      </div>
    </div>
    <nut-popup v-model:visible="coinDropdownActive" round closeable>
      <div class="action-sheet-wrapper">
        <div class="action-sheet-header">
          <span>{{ $t("home.selectCurrency") }}</span>
        </div>
        <div
          class="action-sheet-item"
          v-for="(item, index) in coinList"
          :key="index"
          @click="coinChange(index)"
        >
          <img :src="item.icon ? item.icon : coinDefaultIcon" alt="" />
          <span>{{ item.symbol }}</span>
        </div>
      </div>
    </nut-popup>

    <nut-popup v-model:visible="sourceChainDropdownActive" round closeable>
      <div class="action-sheet-wrapper">
        <div class="action-sheet-header">
          <span>{{ $t("home.selectChain") }}</span>
        </div>
        <div
          class="action-sheet-item"
          v-for="(item, index) in allChainList"
          :key="item.chainId"
          @click="sourceChainChange(index)"
        >
          <img :src="getChainIcon(item.chainId)" alt="" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </nut-popup>

    <nut-popup v-model:visible="targetChainDropdownActive" round closeable>
      <div class="action-sheet-wrapper">
        <div class="action-sheet-header">
          <span>{{ $t("home.selectChain") }}</span>
        </div>
        <div
          class="action-sheet-item"
          v-for="(item, index) in targetChainList"
          :key="item.chainId"
          @click="targetChainChange(index)"
        >
          <img :src="getChainIcon(item.chainId)" alt="" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </nut-popup>
  </div>

  {{ getUserInfo }}
</template>

<script lang="ts" setup name="HomePage">
import Header from "@/components/Header/index.vue";
import { computed } from "vue";
import { useUserStore } from "@/store/modules/user";
import { Issue } from "@nutui/icons-vue";
import { setLang, loadLang, i18n } from "@/i18n";
import { chainList, bridgeAddressList, bridgeOrderList } from "@/api";
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
} from "@wagmi/vue";
import { injected } from "@wagmi/vue/connectors";
import { showToast } from "@nutui/nutui";
import "@nutui/nutui/dist/packages/toast/style/css";
import coinDefaultIcon from "@/assets/icon_default_coin.png";
import { bridgeAbi } from "@/abi/bridge";
import { erc20Abi } from "@/abi/erc20";
import { ethUsdtAbi } from "@/abi/ethUsdt";
import router from "@/router";
import { MaxUint256 } from "ethers";

const showOrderTips = ref(false);
const chainId = useChainId();
const { chains, switchChain } = useSwitchChain();
const { connect } = useConnect();
const {
  address: evmAddress,
  isConnected: isEvmConnected,
  chainId: accountChainId,
} = useAccount();
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
const tronAddress = ref();
const tronBalance = ref();
const isTronConnect = ref(false);
const tronLinkDisconnect = ref(false);
const tronAllowance = ref();
const isTronTrc20HaveNoFee = ref(false);
// 声明一个响应式变量来保存 TronWeb 实例
const tronWebInstance = ref();
let orderListRequests = 0;
// let cellList = ['vue3', 'vite', 'vue-router', 'axios', 'Pinia', 'vue-i18n', 'postcss-px-to-viewport', 'varlet / vant / nutUI', 'eruda'];
const userStore = useUserStore();
const injectedConfig = injected({
  shimDisconnect: false,
});
const langList = ref([
  { label: "简体中文", value: "zh-cn" },
  { label: "English", value: "en-us" },
  { label: "Bahasa Indonesia", value: "id" },
  { label: "Tiếng Việt", value: "vi" },
]);
const getUserInfo = computed(() => {
  const { name = "" } = userStore.getUserInfo || {};
  return name;
});
const isConnected = computed(() => {
  return sourceChainId.value == -1
    ? isTronConnect.value && !tronLinkDisconnect.value
    : isEvmConnected.value;
});
const address = computed(() => {
  return sourceChainId.value == -1 ? tronAddress.value : evmAddress.value;
});
const coinIcon = computed(() => {
  if (coinList.value.length == 0 || !coinList.value[coinIndex.value].icon)
    return coinDefaultIcon;
  return coinList.value[coinIndex.value].icon;
});
const coinName = computed(() => {
  if (coinList.value.length == 0)
    return loadLang()[i18n.global.locale.value].home.pleaseChoose;
  return coinList.value[coinIndex.value].symbol;
});
const feeValue = computed(() => {
  let feeObj = coinList.value[coinIndex.value]?.fee;
  return feeObj
    ? `${feeObj.feeFixed + (isTronTrc20HaveNoFee.value ? feeObj.tronTrc20HaveNoFee : 0)} + ${formatNumber((feeObj.feePercent * 1000000 * ((coinNum.value ?? 0) * 1000000)) / 100000000000000)}`
    : "--";
});

const bridgeAddress = computed(() => {
  return bridgeContractList.value.find(
    (item) =>
      (sourceChainId.value != -1 && item.chainId == chainId.value) ||
      (sourceChainId.value == -1 && item.chainId.includes("tron")),
  )?.bridgeAddress;
});
const tokenAddress = computed(() => {
  return coinList.value[coinIndex.value]?.type == "native"
    ? undefined
    : coinList.value[coinIndex.value]?.address;
});
const sourceChainId = computed(() => {
  const id = allChainList.value
    ? allChainList?.value[sourceChainIndex.value]?.chainId
    : undefined;
  console.log("sourceChainId", id, allChainList.value, sourceChainIndex.value);
  return id ? (id.includes("tron") ? -1 : Number(id)) : undefined;
});
const isEthUsdt = computed(() => {
  return (
    chainId.value == 1 &&
    tokenAddress.value == "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  );
});
const tokenBalance = computed(() => {
  console.log("tokenBalance", evmBalance);
  return sourceChainId.value == -1
    ? tronBalance.value
    : evmBalance.data?.value?.formatted;
});
const evmBalance = useBalance({
  address: address,
  token: tokenAddress,
  chainId: sourceChainId,
});
const getTronBalance = async () => {
  tronBalance.value = null;
  tronAllowance.value = null;
  if (window.tronWeb.ready) {
    if (tokenAddress.value) {
      console.log("getTronBalance tokenAddress", tokenAddress.value);
      const contract = await window.tronWeb.contract().at(tokenAddress.value);
      const balance = await contract.balanceOf(address.value).call();
      tronBalance.value =
        Number(balance) /
        Math.pow(10, coinList.value[coinIndex.value].decimals);
      const allowance = await contract
        .allowance(address.value, bridgeAddress.value)
        .call();
      tronAllowance.value =
        Number(allowance) /
        Math.pow(10, coinList.value[coinIndex.value].decimals);
      console.log("tronBalance:", tronBalance.value);
      console.log("tronAllowance:", tronAllowance.value);
    } else {
      tronWebInstance.value.trx
        .getBalance(address.value)
        .then((res) => {
          tronBalance.value =
            res / Math.pow(10, coinList.value[coinIndex.value].decimals);
        })
        .catch((err) => {
          console.log("tron balance err", err);
        });
    }
  }
};

const allowanceResult = useReadContract({
  abi: erc20Abi,
  address: tokenAddress,
  functionName: "allowance",
  args: [address as any, bridgeAddress],
});

const { data: approveHash, writeContract: approveWriteContract } =
  useWriteContract();

const { isLoading: isAllowanceing, isSuccess: isAllowanceed } =
  useWaitForTransactionReceipt({
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
watch([toAccountAddress, sourceChainIndex, targetChainIndex, coinIndex], () => {
  getTronReceivingBalance();
});
watch(address, (newValue, oldValue) => {
  console.log(`address 的值从 ${oldValue} 变为 ${newValue}`);
  if (oldValue != undefined && newValue) {
    getOrderList();
  }
  evmBalance.refetch();
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
  document.addEventListener("click", closeDropdown);
  tronWebInstance.value = new TronWeb({
    fullHost: "https://api.shasta.trongrid.io",
    solidityNode: "https://api.shasta.trongrid.io",
    eventServer: "https://api.shasta.trongrid.io",
    // privateKey: 'd275b5ce1a4807e0ee906f77dc4f82dc6c920fca348a9e31f9903cac7ddacf62'
  });
  tronWebInstance.value.setAddress("TKLoEdqS4Hg3rjU9LVJqJAtGG1gFdb1Mpi");
  tronLinkDisconnect.value =
    localStorage.getItem("tronLinkDisconnect") == "true" ? true : false;
  if (typeof window.tronLink != "undefined") {
    tronAddress.value = window.tronWeb.defaultAddress.base58;
    isTronConnect.value = window.tronWeb.ready;
  }
  window.addEventListener("message", function (e) {
    if (e.data.message && e.data.message.action == "disconnect") {
      // handler logic
      console.log("got connect event", e.data);
      tronAddress.value = "";
      isTronConnect.value = window.tronWeb.ready;
    }
    if (e.data.message && e.data.message.action === "accountsChanged") {
      // handler logic
      console.log("got accountsChanged event", e.data);
      tronAddress.value = e.data.message.data.address;
      isTronConnect.value = window.tronWeb.ready;
      if (isConnected.value && sourceChainId.value == -1) {
        getTronBalance();
      }
    }
  });

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
  document.removeEventListener("click", closeDropdown);
});

const tronApprove = async () => {
  try {
    const _tokenAddress = tokenAddress.value;
    const balance = (
      Number(tronBalance.value) *
      Math.pow(10, coinList.value[coinIndex.value].decimals)
    ).toString();
    const parameter = [
      { type: "address", value: bridgeAddress.value },
      { type: "uint256", value: MaxUint256.toString() },
    ];
    var tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
      tokenAddress.value,
      "approve(address,uint256)",
      {
        shouldPollResponse: true,
      },
      parameter,
      address.value,
    );
    var signedTx = await window.tronWeb.trx.sign(tx.transaction);
    var broastTx = await window.tronWeb.trx.sendRawTransaction(signedTx);
    console.log("broastTx", broastTx);
    if (_tokenAddress == tokenAddress.value) {
      const contract = await window.tronWeb.contract().at(tokenAddress.value);
      const allowance = await contract
        .allowance(address.value, bridgeAddress.value)
        .call();
      tronAllowance.value =
        Number(allowance) /
        Math.pow(10, coinList.value[coinIndex.value].decimals);
    }
    lockApprove.value = false;
  } catch (res: any) {
    lockApprove.value = false;
    console.log("approveErr:", res);
    /// 取消授权
    if (res.toString().includes("Confirmation declined by user"))
      return showToast.text(
        loadLang()[i18n.global.locale.value].home.cancelApprove,
      );
    /// 交易失败
    return showToast.text(
      loadLang()[i18n.global.locale.value].home.ApproveFailed,
    );
  }
};

const tronDeposit = async (amount) => {
  try {
    if (window.tronWeb.ready) {
      const parameter = [
        { type: "address", value: toAccountAddress.value ?? address.value },
        { type: "uint256", value: amount },
        {
          type: "string",
          value: targetChainList.value[targetChainIndex.value].chainId,
        },
        { type: "address", value: tokenAddress.value },
      ];
      console.log("parameter", parameter);
      // return;
      var tx = await window.tronWeb.transactionBuilder.triggerSmartContract(
        bridgeAddress.value,
        "Deposit(address,uint256,string,address)",
        {
          callValue: 0,
        },
        parameter,
        address.value,
      );
      var signedTx = await window.tronWeb.trx.sign(tx.transaction);
      var broastTx = await window.tronWeb.trx.sendRawTransaction(signedTx);
      console.log("broastTx", broastTx);
      showToast.text(
        loadLang()[i18n.global.locale.value].home.submitSuccessful,
      );
    }
    lockSubmit.value = false;
  } catch (res: any) {
    lockSubmit.value = false;
    console.log("approveErr:", res);
    /// 取消支付
    if (res.toString().includes("Confirmation declined by user"))
      return showToast.text(
        loadLang()[i18n.global.locale.value].home.cancelPayment,
      );
    /// 交易失败
    return showToast.text(
      loadLang()[i18n.global.locale.value].home.transactionFailed,
    );
  }
};

const changeLang = (type) => {
  setLang(type);
  langDropdownActive.value = false;
  getOrderList();
};

const closeDropdown = (event) => {
  if (!event.target.closest(".lang-select")) {
    langDropdownActive.value = false;
  }
  if (!event.target.closest(".wallet-connect")) {
    walletDropdownActive.value = false;
  }
  if (!event.target.closest(".network-select")) {
    networkDropdownActive.value = false;
  }
};

const getChainList = () => {
  chainList().then((res) => {
    allChainList.value = res.data ?? [];
    if (allChainList.value.length == 0) return;
    sourceChainDropdownActive.value = false;
    const _sourceChainId = localStorage.getItem("sourceChainId");
    if (_sourceChainId) {
      let id = JSON.parse(_sourceChainId);
      let index = allChainList.value.findIndex((item) =>
        id == -1 ? item.chainId.includes("tron") : item.chainId == id,
      );
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
  // orderList.value = [
  //   {
  //     orderId: -1,
  //     name: -1,
  //     amount: 100,
  //     status: { code: 0, msg: "Processing" },
  //     sourceChain: { chainId: 1, name: "111" },
  //     targetChain: { chainId: 1, name: "111" },
  //     sourceCoin: { chainId: 1, name: "111" },
  //     targetCoin: { chainId: 1, name: "111" },
  //     fee: 0,
  //   },
  // ];
  // console.log("orderList.value", orderList.value);
};

const getBridgeAddressList = () => {
  bridgeAddressList().then((res) => {
    bridgeContractList.value = res.data;
  });
};

const getTargetChainList = () => {
  targetChainIndex.value = 0;
  targetChainList.value =
    allChainList.value[sourceChainIndex.value]?.targetChains ?? [];
};

const getCoinList = () => {
  coinIndex.value = 0;
  coinList.value =
    targetChainList.value[targetChainIndex.value]?.sourceCoins ?? [];
  if (sourceChainId.value == -1) getTronBalance();
};
const submit = async () => {
  if (lockSubmit.value) return;
  if (!coinNum.value) {
    return showToast.text(
      loadLang()[i18n.global.locale.value].home.inputQuantity,
    );
  }
  if (Number(coinNum.value) > Number(tokenBalance.value ?? 0)) {
    return showToast.text(
      loadLang()[i18n.global.locale.value].home.insufficientBalance,
    );
  }
  let feeObj = coinList.value[coinIndex.value]?.fee;
  if (
    coinNum.value <
    feeObj.feeFixed +
      (isTronTrc20HaveNoFee.value ? feeObj.tronTrc20HaveNoFee : 0) +
      (feeObj.feePercent / 100) * coinNum.value
  ) {
    return showToast.text(loadLang()[i18n.global.locale.value].home.submitTips);
  }
  if (!toAccountAddress.value) {
    return showToast.text(
      loadLang()[i18n.global.locale.value].home.pleaseEnterThepaymentAddress,
    );
  }
  if (targetChainList.value[targetChainIndex.value].chainId.includes("tron")) {
    console.log("tronWebInstance", tronWebInstance.value);
    if (!tronWebInstance.value.isAddress(toAccountAddress.value)) {
      return showToast.text(
        loadLang()[i18n.global.locale.value].home.addressError,
      );
    }
  } else {
    if (!/^0x[0-9a-fA-F]{40}$/.test(toAccountAddress.value)) {
      return showToast.text(
        loadLang()[i18n.global.locale.value].home.addressError,
      );
    }
  }

  lockSubmit.value = true;
  const amount = BigInt(
    Number(coinNum.value) *
      Math.pow(10, coinList.value[coinIndex.value].decimals),
  );
  if (sourceChainId.value == -1) tronDeposit(amount);
  else evmDeposit(amount);
};

const evmDeposit = (amount) => {
  try {
    let toChainId = targetChainList.value[targetChainIndex.value].chainId;
    depositWriteContract(
      {
        abi: bridgeAbi,
        address: bridgeAddress.value,
        functionName: "Deposit",
        value: tokenAddress.value === undefined ? amount : undefined,
        args: [
          toChainId == "tron"
            ? tronToEth(toAccountAddress.value)
            : toAccountAddress.value,
          amount,
          toChainId,
          coinList.value[coinIndex.value].address, // tokenAddress
        ],
      },
      {
        onSettled: () => {
          lockSubmit.value = false;
        },
        onError: (res) => {
          if (
            res.message.includes("User rejected the request") ||
            res.message.includes("User denied transaction")
          )
            return showToast.text(
              loadLang()[i18n.global.locale.value].home.cancelPayment,
            );
          console.log("onError", res);
          return showToast.text(
            loadLang()[i18n.global.locale.value].home.transactionFailed,
          );
        },
        onSuccess: (res) => {
          showToast.text(
            loadLang()[i18n.global.locale.value].home.submitSuccessful,
          );
          console.log("depositSuc:", res);
        },
      },
    );
  } catch (error) {
    lockSubmit.value = false;
    showToast.text(loadLang()[i18n.global.locale.value].home.transactionFailed);
  }
};

const tronToEth = (addr) => {
  const hex = window.tronWeb.address.toHex(addr);

  // 去掉 41 前缀 → 换成 0x
  return "0x" + hex.slice(2);
};

const approve = () => {
  if (lockApprove.value || !coinNum.value) return;
  if (
    sourceChainId.value != -1 &&
    (isAllowanceing.value || refetchAllowance.value)
  )
    return;
  lockApprove.value = true;
  if (sourceChainId.value == -1) tronApprove();
  else evmApprove();
};

const evmApprove = () => {
  try {
    approveWriteContract(
      {
        abi: isEthUsdt.value ? ethUsdtAbi : erc20Abi, ///eth-usdt abi返回格式与其他erc20不一样
        address: tokenAddress.value,
        functionName: "approve",
        args: [
          bridgeAddress.value,
          evmBalance?.data?.value?.value ?? 10000000000000000000000000000000n,
        ],
      },
      {
        onSettled: (_) => {
          lockApprove.value = false;
        },
        onError: (res) => {
          /// 取消授权
          if (
            res.message.includes("User rejected the request") ||
            res.message.includes("User denied transaction")
          )
            return showToast.text(
              loadLang()[i18n.global.locale.value].home.cancelApprove,
            );
          console.log("approveErr:", res);
          /// 交易失败
          return showToast.text(
            loadLang()[i18n.global.locale.value].home.ApproveFailed,
          );
        },
      },
    );
  } catch {
    lockApprove.value = false;
    showToast.text(loadLang()[i18n.global.locale.value].home.ApproveFailed);
  }
};

const getTronReceivingBalance = async () => {
  if (
    targetChainList.value[targetChainIndex.value].chainId.includes("tron") &&
    tronWebInstance.value.isAddress(toAccountAddress.value)
  ) {
    let _coinSymbol =
      coinList.value[coinIndex.value].symbol == "KUSD"
        ? "USDT"
        : coinList.value[coinIndex.value].symbol;
    let _tokenAddress = "";
    allChainList.value.forEach((item) => {
      if (item.chainId.includes("tron")) {
        item.targetChains.forEach((targetItem) => {
          targetItem.sourceCoins.forEach((coinItem) => {
            if (coinItem.symbol == _coinSymbol) {
              _tokenAddress = coinItem.address;
            }
          });
        });
      }
    });
    const contract = await tronWebInstance.value.contract(
      erc20Abi,
      _tokenAddress,
    );
    const balance = await contract.balanceOf(toAccountAddress.value).call();
    isTronTrc20HaveNoFee.value = balance == 0;
  } else {
    isTronTrc20HaveNoFee.value = false;
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
  if (sourceChainId.value == -1) tronConnect();
  else evmConnect();
};

const evmConnect = () => {
  if (typeof window.ethereum === "undefined") {
    // 如果 window.ethereum 未定义，说明用户未安装 MetaMask
    showToast.text(
      `${loadLang()[i18n.global.locale.value].home.pleaseInstallFirst} MetaMask`,
    );
  } else {
    connect(
      { connector: injectedConfig },
      {
        onSuccess: () => {
          coinDropdownActive.value =
            sourceChainDropdownActive.value =
            targetChainDropdownActive.value =
              false;
        },
        onError: (error) => {
          console.log(error);
          reconnect();
        },
      },
    );
  }
};
const tronConnect = () => {
  if (typeof window.tronLink === "undefined") {
    // 沒安裝插件
    showToast.text(
      `${loadLang()[i18n.global.locale.value].home.pleaseInstallFirst} TronLink`,
    );
  } else {
    // 有安裝插件
    if (window.tronLink.ready) {
      // 錢包插件連接成功
      tronAddress.value = window.tronWeb.defaultAddress.base58;
      isTronConnect.value = window.tronWeb.ready;
      tronLinkDisconnect.value = false;
      localStorage.setItem("tronLinkDisconnect", "false");
    } else {
      console.log("未連接錢包，喚起錢包插件登入彈窗");
      // 未連接錢包，喚起錢包插件登入彈窗
      window.tronLink
        .request({ method: "tron_requestAccounts" })
        .then((res) => {
          if (!res) {
            showToast.text(
              `${loadLang()[i18n.global.locale.value].home.tronLinkLock}`,
            );
          } else if (res.code === 200) {
            tronAddress.value = window.tronWeb.defaultAddress.base58;
            tronLinkDisconnect.value = false;
            localStorage.setItem("tronLinkDisconnect", "false");
          }
          isTronConnect.value = window.tronWeb.ready;
        });
    }
  }
};

const walletDisconnect = () => {
  if (sourceChainId.value == -1) {
    localStorage.setItem("tronLinkDisconnect", "true");
    tronLinkDisconnect.value = true;
  } else {
    disconnect(
      {},
      {
        onSuccess: () => {
          console.log("断开连接成功");
          if (isConnected.value) walletDisconnect();
        },
        onError: (error) => {
          console.log(error);
        },
      },
    );
  }
  walletDropdownActive.value = false;
};

const networkChange = (id) => {
  console.log(id);
  if (id == -1 || id.toString().includes("tron")) {
    networkDropdownActive.value = sourceChainDropdownActive.value = false;
    const index = allChainList.value.findIndex((item) =>
      item.chainId.includes("tron"),
    );
    sourceChainChange(index);
    return;
  }
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
        console.log("切换网络成功");
        networkDropdownActive.value = sourceChainDropdownActive.value = false;
        const index = allChainList.value.findIndex(
          (item) => item.chainId == id,
        );
        sourceChainChange(index);
        allowanceResult.refetch();
      },
      onError: (error) => {
        showToast.text(`_chain?.id: ${_chain?.id}`);
        console.log("切换网络失败", error.message);
      },
    },
  );
};

const coinChange = (index) => {
  coinDropdownActive.value = false;
  coinIndex.value = index;
  if (sourceChainId.value == -1) getTronBalance();
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
  localStorage.setItem("sourceChainId", JSON.stringify(sourceChainId.value));
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
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.setAttribute("value", text);
      input.select();
      if (document.execCommand("copy")) {
        document.execCommand("copy");
      }
      document.body.removeChild(input);
      showToast.text(loadLang()[i18n.global.locale.value].home.copySuccess);
    });
};
///根据链id，打开区块链浏览器
const openExplorer = () => {
  let url = "";
  let id =
    sourceChainId.value == -1
      ? allChainList.value[sourceChainIndex.value].chainId
      : chainId.value;
  switch (id) {
    case 1:
      url = `https://etherscan.io/address/${address.value}`;
      break;
    case 56:
      url = `https://bscscan.com/address/${address.value}`;
      break;
    case 28569:
      url = `https://explorer.datachain.top/address/${address.value}`;
      break;
    case 42164:
      url = `https://arbiscan.io/address/${address.value}`;
      break;
    case 878:
      url = `https://kadscan.kadsea.org/address/${address.value}`;
      break;
    case 97:
      url = `https://testnet.bscscan.com/address/${address.value}`;
      break;
    case "tron shasta":
      url = `https://shasta.tronscan.org/#/address/${address.value}`;
      break;
    case "tron":
      url = `https://tronscan.org/#/address/${address.value}`;
      break;
    case 1206:
      url = `https://explorer.ltlabchain.com/#/address/${address.value}`;
      break;
    default:
      break;
  }
  walletDropdownActive.value = false;
  window.open(url, "_blank");
};
const toDetail = (item) => {
  router.push({ path: "/order/detail", query: { orderId: item.orderId } });
};
const formatNumber = (number: number | string): string => {
  // 将输入转换为数字
  number = parseFloat(number.toString());

  // 如果是科学计数法的数字，则将其转换为非科学计数法的字符串
  if (
    Math.abs(number) >= 1e21 ||
    (Math.abs(number) > 0 && Math.abs(number) < 1e-6)
  ) {
    return number.toFixed(20).replace(/\.?0+$/, ""); // 使用固定位数的小数点表示法，并去除尾部的0
  }

  // 将数字转换为字符串
  const parsedNumberString = number.toString();

  // 判断是否存在小数点
  const decimalIndex = parsedNumberString.indexOf(".");
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
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  align-items: center;
  padding: 20px 0 40px;
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

  .form {
    width: 600px;
    padding: 20px 15px 30px;
    @media screen and (max-width: 750px) {
      width: auto;
    }

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
      // background: linear-gradient(to bottom right, #0049e7 0%, #c835f8 100%);
      background: linear-gradient(
        90deg,
        rgb(2, 52, 141) 0%,
        rgb(107, 46, 198) 59.62%,
        rgb(131, 51, 166) 100%
      );
      color: #fff;
      font-size: 16px;
      font-weight: 400;
      text-align: center;
      cursor: pointer;
    }
  }

  .record-wrapper {
    width: 600px;
    flex: 1;
    padding: 15px;
    padding-bottom: 18px;
    border-radius: 16px;
    background: #fff;
    @media screen and (max-width: 750px) {
      width: calc(100% - 60px);
      margin: 0 15px;
    }
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
  .action-sheet-wrapper {
    width: 420px;
    border-radius: 16px;
    min-height: 360px;
    @media screen and (max-width: 750px) {
      width: 85vw;
    }
    .action-sheet-header {
      display: flex;
      align-items: center;
      height: 60px;
      padding: 0 15px;
      border-radius: 16px 16px 0 0;
      background: #f5f8ff;
      color: #000e2b;
      font-size: 16px;
      font-weight: 500;
      text-align: left;
      border-bottom: 1px solid rgb(27 26 59 / 10%);
      margin-bottom: 10px;
    }
    .action-sheet-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: 60px;
      padding: 0 25px;
      border-bottom: 1px solid rgb(27 26 59 / 10%);
      background: #fff;
      color: #1b1a3b;
      font-size: 14px;
      font-weight: 400;
      cursor: pointer;
      &:hover {
        background: #f5f8ff;
      }
      &:last-child {
        border-bottom: none;
      }

      img {
        width: 30px;
        height: 30px;
        margin-right: 12px;
        border-radius: 30px;
      }
    }
  }
}
</style>
