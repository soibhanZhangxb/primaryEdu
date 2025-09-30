//正则表达式来判断字符串中是否包含中文字符
import { isString } from "@/store/utils";

export const hasChinese = str => {
  return /[\u4e00-\u9fff]/.test(str);
};

//码长度要求 6~20，并且可以包含 数字、字母、特殊字符中的一种或多种（即不强制要求必须同时包含），可以使用以下正则表达式：
//但不允许包含空格或制表符（Tab）
export const passwordCheck = password => {
  const pattern = /^[^\s]{6,20}$/; // 允许任意非空白字符，长度6~20
  return pattern.test(password);
};

//是否包含中文 使用 Unicode 范围检测
export const isValidateChinese = val => {
  const pattern = /[\u4e00-\u9fa5]/;
  return pattern.test(val);
};

//是否包含中文 使用 Unicode 全面检测，包括中文标点符号
export const isValidateChineseAll = val => {
  const pattern =
    /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f]/;
  return pattern.test(val);
};

//把中文逗号和空格替换成英文逗号
export const replaceToComma = val => {
  if (isString(val)) {
    return val.trim().replace(/[， ]+/g, ",");
  }
  return "";
};
