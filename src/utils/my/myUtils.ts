/**
 * 字符串 split 拆分，同时删除空元素
 * 只想移除空字符串
 */

export const mySplitString = (str: string, separator: string = " ") => {
  const result = str.split(separator).filter(element => element !== "");
  return result;
};

/**
 * 字符串 split 拆分，同时删除空元素
 * ilter(Boolean) 会移除所有 falsy 值（空字符串、0、false、null、undefined、NaN）
 */

export const mySplitRemoveAll = (str: string, separator: string = " ") => {
  const result = str.split(separator).filter(Boolean);
  return result;
};
