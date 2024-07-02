import { http } from '@/utils/request';
import { i18n } from '@/i18n';

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
  return http.get(`/api/v1/order/list?address=${address}&nation=${i18n.global.locale.value}`);
}

export function bridgeOrderDetail(orderId) {
  return http.get(`/api/v1/order/detail?orderId=${orderId}&nation=${i18n.global.locale.value}`);
}
