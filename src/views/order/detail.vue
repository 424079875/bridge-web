<template>
  <div class="order-detail">
    <div class="detail-header">
      <img src="@/assetS/icon_arrow_left.png" @click="router.back" alt="" />
      <span>{{ detail?.sourceCoin?.name }}</span>
    </div>
    <div class="detail-content">
      <div class="detail-status">
        <img :src="getIcon([failIcon, pendingIcon, successIcon][detail?.status.code + 1])" alt="" />
        <div :class="{ 'green-text': detail?.status.code == 1, 'red-text': detail?.status.code == -1 }">{{ detail?.status.msg }}</div>
      </div>

      <div class="detail-type">
        <div class="detail-type-title">{{ $t('order.type') }}</div>
        <nut-skeleton class="detail-type-content" v-if="!detail" :title="false" :round="true" width="150px" height="15px" animated />
        <div class="detail-type-content" v-else>
          <img :src="getIcon(detail?.sourceChain?.icon)" class="detail-type-img" alt="" />
          <span>{{ detail?.sourceChain?.name }}</span>
          <img src="@/assets/icon_arrow_right.png" class="detail-type-arrow" alt="" />
          <img :src="getIcon(detail?.targetChain?.icon)" class="detail-type-img" alt="" />
          <span>{{ detail?.targetChain?.name }}</span>
        </div>
      </div>

      <div class="detail-data">
        <div class="detail-data-item" v-for="(item, index) in dataStrs" :key="index">
          <div class="detail-data-item-title">{{ item.title }}</div>
          <nut-skeleton
            class="detail-data-item-skeleton"
            v-if="!detail"
            :title="false"
            :row="[3, 4].includes(index) ? 2 : 1"
            :round="true"
            width="150px"
            height="15px"
            animated
          />
          <div class="detail-data-item-content" v-else>{{
            !detail ? '' : item.code == 'receiveNum' ? detail?.amount - detail?.fee : detail[item.code]
          }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="LoginPage">
  import router from '@/router';
  import { ref } from 'vue';
  import { bridgeOrderDetail } from '@/api';
  import pendingIcon from '@/assets/icon_pending.png';
  import failIcon from '@/assets/icon_fail.png';
  import successIcon from '@/assets/icon_success.png';
  import defaultIcon from '@/assets/icon_default_coin.png';
  import { i18n } from '@/i18n';

  const route = useRoute();
  const detail = ref<any>();
  const dataStrs = [
    {
      title: i18n.global.messages.value[i18n.global.locale.value].order.transferQuantity,
      code: 'amount',
    },
    {
      title: i18n.global.messages.value[i18n.global.locale.value].order.receiveNum,
      code: 'receiveNum',
    },
    {
      title: i18n.global.messages.value[i18n.global.locale.value].order.fee,
      code: 'fee',
    },
    {
      title: i18n.global.messages.value[i18n.global.locale.value].order.targetAddress,
      code: 'targetAddress',
    },
    {
      title: i18n.global.messages.value[i18n.global.locale.value].order.sourceAddress,
      code: 'sourceAddress',
    },
    {
      title: i18n.global.messages.value[i18n.global.locale.value].order.txHash,
      code: 'txHash',
    },
    {
      title: i18n.global.messages.value[i18n.global.locale.value].order.createTime,
      code: 'createTime',
    },
  ];
  onMounted(() => {
    getData();
  });

  const getData = () => {
    bridgeOrderDetail(route.query.orderId).then((res) => {
      detail.value = res.data;
    });
  };
  const getIcon = (url) => {
    return url == '' || !url ? defaultIcon : url;
  };
</script>

<style scoped lang="scss">
  .order-detail {
    width: 100%;
    min-height: 100%;
    .detail-header {
      display: flex;
      position: fixed;
      align-items: center;
      width: 100vw;
      height: 60px;
      border-bottom: 1px solid #e8effc;
      background: #f5f8ff;
      color: #000e2b;
      font-size: 14px;
      font-weight: 400;
      line-height: 14px;
      text-align: center;

      img {
        position: absolute;
        left: 14px;
        width: 24px;
        height: 24px;
        cursor: pointer;
      }

      span {
        flex: 1;
        padding: 0 38px;
      }
    }

    .detail-content {
      width: 600px;
      padding: 88px 15px 24px;
    margin: 0 auto;

      .detail-status {
        margin: 0 auto 30px;
        text-align: center;

        img {
          display: block;
          width: 80px;
          height: 80px;
          margin: 0 auto 10px;
        }

        div {
          color: #f7b11c;
          font-size: 15px;
          font-weight: 500;
          line-height: 20px;

          &.green-text {
            color: #2fb93b;
          }

          &.red-text {
            color: #ea4b4b;
          }
        }
      }

      .detail-type {
        display: flex;
        margin-bottom: 15px;
        padding: 15px;
        border-radius: 14px;
        background: #fff;

        .detail-type-title {
          flex-shrink: 0;
          margin-right: 20px;
          color: #9da9c4;
          font-size: 13px;
          font-weight: 500;
          line-height: 20px;
          text-align: left;
        }

        .detail-type-content {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: flex-end;
          overflow: hidden;
          color: #000;
          font-size: 14px;
          font-weight: 400;
          line-height: 14px;
          overflow-wrap: break-word;

          .detail-type-img {
            width: 20px;
            height: 20px;
            margin-right: 6px;
            border-radius: 20px;
          }

          .detail-type-arrow {
            width: 14px;
            height: 14px;
            margin: 0 15px;
          }
        }
      }

      .detail-data {
        padding: 0 15px;
        border-radius: 14px;
        background: #fff;

        .detail-data-item {
          display: flex;
          padding: 15px 0;
          border-bottom: 1px solid #e8effc;

          .detail-data-item-title {
            flex-shrink: 0;
            margin-right: 20px;
            color: #9da9c4;
            font-size: 13px;
            font-weight: 500;
            line-height: 20px;
            text-align: left;
          }

          .detail-data-item-skeleton {
            display: flex;
            flex: 1;
            justify-content: end;
          }

          .detail-data-item-content {
            flex: 1;
            overflow: hidden;
            color: #000e2b;
            font-size: 13px;
            font-weight: 500;
            line-height: 20px;
            text-align: right;
            overflow-wrap: break-word;
          }
        }
      }
    }
  }
</style>
