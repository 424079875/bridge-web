import { http } from '@/utils/request';

/**
 * 账号密码登录
 * @returns UseAxiosReturn
 */
export function chainList() {
  return http.get(`/api/v1/chain/list`);
}

export function bridgeAddressList() {
  return http.get(`/api/v1/chain/bridge/address/list`);
}

export function bridgeOrderList(address) {
  return http.get(`/api/v1/order/list?address=${address}&nation=zh-CN`);
}

export function bridgeOrderDetail(orderId) {
  return http.get(`/api/v1/order/detail?orderId=${orderId}&nation=zh-CN`);
}