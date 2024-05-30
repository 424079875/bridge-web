<template>
  <div class="order-detail">
    <div class="detail-header">
      <img src="@/assetS/icon_arrow_left.png" @click="router.back" alt="">
      <span>{{ detail?.sourceCoin?.name }}</span>
    </div>
    <div class="detail-content">
      <div class="detail-status">
        <img :src="getIcon([failIcon, pendingIcon, successIcon][detail?.status.code + 1])" alt="">
        <div>{{ detail?.status.msg }}</div>
      </div>

      <div class="detail-type">
        <div class="detail-type-title">类型</div>
        <nut-skeleton class="detail-type-content" v-if="!detail":title="false" :round="true" width="150px" height="15px"  animated></nut-skeleton>
        <div class="detail-type-content" v-else>
          <img :src="getIcon(detail?.sourceChain?.icon)" class="detail-type-img" alt="">
          <span>{{ detail?.sourceChain?.name }}</span>
          <img src="@/assets/icon_arrow_right.png" class="detail-type-arrow" alt="">
          <img :src="getIcon(detail?.targetChain?.icon)" class="detail-type-img" alt="">
          <span>{{ detail?.targetChain?.name }}</span>
        </div>
      </div>

      <div class="detail-data">
        <div class="detail-data-item" v-for="(item,index) in dataStrs">
          <div class="detail-data-item-title">{{ item.title }}</div>
          <nut-skeleton class="detail-data-item-skeleton" v-if="!detail":title="false" :row="[3,4].includes(index) ? 2 : 1" :round="true" width="150px" height="15px"  animated></nut-skeleton>
          <div class="detail-data-item-content" v-else>{{ !detail ? '' : item.code == 'receiveNum' ? (detail?.amount - detail?.fee) :  detail[item.code] }}</div>
        </div>
      </div>
    </div>
   
  </div>
</template>

<script lang="ts" setup name="LoginPage">
  import router from '@/router';
  import { reactive, ref } from 'vue';
  import { bridgeOrderDetail } from '@/api';
  import pendingIcon from '@/assets/icon_pending.png';
  import failIcon from '@/assets/icon_fail.png';
  import successIcon from '@/assets/icon_success.png';
  import defaultIcon from '@/assets/icon_default_coin.png';

  const route = useRoute();
  const detail = ref<any>();
  const dataStrs = [{
    title: '转出数量',
    code: 'amount'
  },{
    title: '收到数量',
    code: 'receiveNum'
  },{
    title: '手续费',
    code: 'fee'
  },{
    title: '收款地址',
    code: 'targetAddress'
  },{
    title: '打款地址',
    code: 'sourceAddress'
  },{
    title: '交易号',
    code: 'txHash'
  },{
    title: '跨链时间',
    code: 'createTime'
  }];
  onMounted(()=>{
    getData()
  })

  const getData = ()=>{
    bridgeOrderDetail(route.query.orderId).then((res)=>{
      detail.value = res.data;

    })
  }
  const getIcon = (url)=>{
    return url == '' || !url ? defaultIcon : url
  }
</script>

<style scoped lang="scss">
  .order-detail {
    min-height: 100%;
    width: 100%;
    .detail-header{
      position: fixed;
      display: flex;
      align-items: center;
      width: 100%;
      height: 44px;
      border-bottom: 1px solid #E8EFFC;
      font-weight: 400;
      font-size: 14px;
      color: #000E2B;
      line-height: 14px;
      text-align: center;
      background: #F5F8FF;
      img{
        width: 24px;
        height: 24px;
        position: absolute;
        left: 14px;
        cursor: pointer;
      }
      span{
        flex: 1;
        padding: 0 38px;
      }
    }
    .detail-content{
      padding: 68px 15px 24px;
      .detail-status{
        margin: 0 auto 30px;
        text-align: center;
        img{
          width: 80px;
          height: 80px;
          display: block;
          margin: 0 auto 10px;
        }
        div{
          font-weight: 500;
          font-size: 15px;
          color: #F7B11C;
          line-height: 20px;
          &.green-text{
            color: #2FB93B;
          }
          &.red-text{
            color: #EA4B4B;
          }
        }
      }

      .detail-type{
        display: flex;
        background: #FFFFFF;
        border-radius: 14px;
        padding: 15px;
        margin-bottom: 15px;
        .detail-type-title{
          font-weight: 500;
          font-size: 13px;
          color: #9DA9C4;
          line-height: 20px;
          text-align: left;
          flex-shrink: 0;
          margin-right: 20px;
        }
        .detail-type-content{
          flex: 1;
          display: flex;
          justify-content: flex-end;
          font-weight: 400;
          font-size: 14px;
          color: #000000;
          line-height: 14px;
          overflow: hidden;
          overflow-wrap: break-word;
          .detail-type-img{
            width: 20px;
            height: 20px;
            border-radius: 20px;
            margin-right: 6px;
          }
          .detail-type-arrow{
            width: 14px;
            height: 14px;
            margin: 0 15px;
          }
        }
      }

      .detail-data{
        background: #FFFFFF;
        border-radius: 14px;
        padding: 0 15px;
        .detail-data-item{
          padding: 15px 0;
          display: flex;
          border-bottom: 1px solid #E8EFFC;
          .detail-data-item-title{
            font-weight: 500;
            font-size: 13px;
            color: #9DA9C4;
            line-height: 20px;
            text-align: left;
            margin-right: 20px;
            flex-shrink: 0;
          }
          .detail-data-item-skeleton{
            display: flex;
            flex: 1;
            justify-content: end;
          }
          .detail-data-item-content{
            flex: 1;
            font-weight: 500;
            font-size: 13px;
            color: #000E2B;
            line-height: 20px;
            text-align: right;
            overflow-wrap: break-word;
            overflow: hidden;
           
          }
        }
      }
    }


   
  }
</style>
