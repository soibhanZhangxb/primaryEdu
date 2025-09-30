import { isString } from "@pureadmin/utils";
import { isNumber } from "@/store/utils";

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

/**
 * 过滤特殊字符
 */
export const filterSpecialChars = (val: string) => {
  //const regexpSpecialStr = /[-~#（）|【-】· (){}+=*^&%$@!.,，。<>;:：；‘’“”、'"?`\_\/\\]/g;
  const regexpSpecialStr = /[#·{}+=*^&%$@!.,，。<>;:：；‘’“”、'"`\\/\\]/g;
  return val.replace(regexpSpecialStr, "");
};
//检查所有属性是否为 falsy 值（null、undefined、""、0、false）
export function objectIsEmpty(obj) {
  return Object.values(obj).every(val => !val);
}
//单引号转义函数
export function singleQuotationMarksEscape(str: string) {
  if (!str) return "";
  return str.replace("'", "");
}

export function singleQuotationMarksEscapeObject(obj: object) {
  for (let key in obj) {
    if (typeJudge(obj[key], "string")) {
      obj[key] = singleQuotationMarksEscape(obj[key]);
    }
  }
  return obj;
}
export function singleQuotationMarksEscapeArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (typeJudge(arr[i], "string")) {
      arr[i] = singleQuotationMarksEscape(arr[i]);
    }
  }
  return arr;
}

/**
 * 类型判断
 */
export function typeJudge(s: any, type: string) {
  //typeof 用来判断变量类型
  if (type == "string") {
    return typeof s === "string";
  } else if (type == "number") {
    return typeof s === "number";
  } else if (type == "object") {
    return typeof s === "object";
  } else if (type == "boolean") {
    return typeof s === "boolean";
  } else if (type == "undefined") {
    return typeof s === "undefined";
  } else if (type == "functon") {
    return typeof s === "function";
  }
  return false;
}
export function isEmpty(value: any) {
  return value == undefined || value == "" || value == null;
}

//使用正则表达式来检测字符串是否只包含数字、英文字母、连字符(-)
export function isOnlyNumberAndLetter(str: string) {
  return /^[0-9a-zA-Z-]+$/.test(str);
}

//删除字符串前后空格 tab
export function trimSpacesAndTabs(str: string | number | undefined) {
  if (str == undefined) return "";
  if (typeof str == "number") return str.toString();
  return str.replace(/^\s+|\s+$/g, "");
}

/**
 * 数字转字符串
 * let str = `${num}`,,, num.toString(),,, String(num),,,, ''+num
 * @param number
 */
export function numToString(num: number) {
  return num.toString();
}

/**
 * 字符串转数字
 * let num = Number(str),,, parseInt(str),,, parseFloat(str)
 * @param str
 */
export function stringToNumber(str: string) {
  return parseInt(str);
}

export function numberToString(number: number) {
  return number.toString();
}

export function stringTonumber(string: string) {
  return parseInt(string);
}

// Parse the time to string
export function parseTime(
  time?: object | string | number,
  cFormat?: string
): string | null {
  if (time === undefined) {
    return null;
  }
  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date: Date;
  if (typeof time === "object") {
    date = time as Date;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj: { [key: string]: number } = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    if (result.length > 0 && value < 10) {
      return "0" + value;
    }
    return String(value) || "0";
  });
  return timeStr;
}

// Format and filter json data using filterKeys array
export function formatJson(
  filterKeys: any,
  jsonData: any,
  organHash: any,
  beidou: any,
  statuss: any
) {
  jsonData.map((data: any) =>
    filterKeys.map((key: string) => {
      if (key === "createtime" || key === "passtime") {
        return parseTime(data[key]);
      } else {
        if (key === "fromOrgan" || key === "toOrgan" || key === "organId") {
          return organHash[data[key]];
        } else if (key === "status") {
          return statuss[data[key]].val;
        } else if (key === "chiptype") {
          return data[key];
        } else if (beidou[key] !== undefined) {
          return beidou[key][data[key]] == undefined
            ? ""
            : beidou[key][data[key]].val;
        } else {
          return data[key];
        }
      }
    })
  );
}

/**
 * Format and filter json data using filterKeys array
 * 把 jsonData= [{},{}] 数组转换成 [[],[],[]]
 * map()方法用于对数组元素进行处理并返回新数组，而不改变原始数据
 * @param filterKeys
 * @param jsonData
 *
 * //map遍历最好方法，object遍历最好方法
 */
export function formatJsonToArray(filterKeys: any, jsonData: any) {
  return jsonData.map((data: any) =>
    filterKeys.map((key: string) => {
      if (key === "timestamp") {
        return parseTime(data[key]);
      } else {
        return data[key];
      }
    })
  );
}

//替换中文分号；为英文; 同时去掉结尾的分号
export function replaceFenHao(val) {
  if (!isEmpty(val)) {
    val = `${val}`.replace(/；/g, ";");
    /*
     * +号是匹配前面元素一次或多次，可以去除多个连续分号
     * $ 表示匹配字符串的结尾
     */
    val = val.replace(/;+$/, "");
    return val;
  }
  return "";
}
// Check if an element has a class
export function hasClass(ele: HTMLElement, className: string) {
  return !!ele.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
}

// Add class to element
export function addClass(ele: HTMLElement, className: string) {
  if (!hasClass(ele, className)) ele.className += " " + className;
}

// Remove class from element
export function removeClass(ele: HTMLElement, className: string) {
  if (hasClass(ele, className)) {
    const reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
    ele.className = ele.className.replace(reg, " ");
  }
}

// Toggle class for the selected element
export function toggleClass(ele: HTMLElement, className: string) {
  if (!ele || !className) {
    return;
  }
  let classString = ele.className;
  const nameIndex = classString.indexOf(className);
  if (nameIndex === -1) {
    classString += "" + className;
  } else {
    classString =
      classString.substring(0, nameIndex) +
      classString.substring(nameIndex + className.length);
  }
  ele.className = classString;
}

/**
 * 获取 organId 的所有父类ids
 */
export function organIdToOrganIds(organId: string) {
  let organIds: string[] = [];
  if (organId) {
    for (let i = 1; i <= organId.length / 2; i++) {
      organIds.push(organId.substring(0, 2 * i));
    }
  }
  return organIds;
}

/**
 * 获取单位选择的id,或者子ids,,, 如果是多个字ids则逗号隔开
 * @param organIds
 * @param isOne     是否为一维数组，获取最后一个id, 否则为多维获取每一组最后一个id
 */
export function getOrganIds(organIds: any, isMulti: boolean = true) {
  let ids: string[] = [],
    n = organIds.length;
  if (isMulti) {
    for (let i = 0; i < n; i++) {
      let childs: string[] = organIds[i];
      ids.push(childs[childs.length - 1]);
    }
  } else {
    if (n > 0) {
      ids.push(organIds[n - 1]);
    }
  }
  return ids.length > 0 ? ids.join(",") : "";
}

/*
 * 浅拷贝，只拷贝des存在的属性
 */
export function objCopy(des: any, src: any) {
  for (let key in des) {
    if (src[key] != undefined) {
      des[key] = src[key];
    }
  }
}

export function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 对象拷贝，对象深度拷贝
 */
export function objClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function deepClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}


export function resetPercent(list: any = [], field: string = "total") {
  let total = 0;
  list.forEach((item: any) => {
    item.percent = 0.0;
    total += item[field];
  });
  list.forEach((item: any) => {
    item.percent = Number((item[field] / total).toFixed(3));
  });
  return list;
}

/**
 * 驼峰转下划线
 *  例如： Humpt2Line('aBcdEfg') //a_bcd_efg
 */
export function Humpt2Line(name: string) {
  return name.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * 下划线转驼峰
 *  例如 ：LinetoHump('hello_js_go') //helloJsGo
 */
export function LinetoHump(name: string) {
  return name.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

/**
 * 列表转map
 * @param list
 * @param key
 * @param vlaue
 * @constructor
 */
export function ListToMap(list: any, key: string, vlaue: string = "") {
  let map: any = {};
  if (list && list instanceof Array) {
    list.forEach(item => {
      if (item[key]) map[item[key]] = vlaue == "" ? item : item[vlaue];
    });
  }
  return map;
}

/**
 * 拷贝对象值给目标对象【把src对象里面的对应目标type的值付给 des[i].value】
 * @param src 源对象 {type: value}
 * @param des 目标数组 []
 */
export function setChartDataValueFromtype(src, des) {
  for (let i = 0; i < des.length; i++) {
    let key = des[i].type;
    if (src[key]) {
      des[i].value = src[key];
    }
  }
}

/**
 * 拷贝数组 过滤特定序号的元素
 */
export function excelHeaderCopy(arr: string[], filterItem: number[]) {
  let des: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (filterItem.indexOf(i) == -1) {
      des.push(arr[i]);
    }
  }
  return des;
}

/**
 * @description 数组转 map
 * @param tHeader
 * @param filterVal
 */
export function arrayToMap(arrKey: string[], arrVal: string[]) {
  let map: { [key: string]: string } = {};
  for (let i = 0; i < arrKey.length; i++) {
    map[arrKey[i]] = arrVal[i];
  }
  return map;
}

/**
 * 校验导入的模板数据是否正确
 */
export function excelDataeplace(beidou: any, results: any, newResults: any) {
  let msg: string[] = [];
  let errors = beidou.tplBody.errors;
  for (let i = 0; i < results.length; i++) {
    let item: any = {};
    for (let key in results[i]) {
      if (beidou.tplBody[key] != undefined) {
        if (beidou.tplBody[key][results[i][key]] != undefined) {
          //替换成数值
          item[key] = parseInt(beidou.tplBody[key][results[i][key]]);
        } else {
          item[key] = 0;
          msg.push(errors[key] != undefined ? errors[key] : key);
        }
      } else {
        item[key] = results[i][key];
      }
    }
    newResults.push(item);
  }
  if (msg.length > 0) {
    //数组去重
    let m = Array.from(new Set(msg));
    return "内容不合法：" + m.join();
  }
  return "";
}

/*
  export function chazhuangEnd(title: string) {
    let end = Date.now();
    let s = ((end - chazhuangDate) / 1000).toFixed(1);
    console.info(`=====>${title}: ${s}秒`);
    //console.log(`=====>title: ${s}秒`);
  }*/

/**
 * 删除字符串中出空格以外的其它特殊字符（除字母、数字、汉字外所有的特殊字符）
 */
export function removeAllSpecialChars(str: string) {
  if (str == null || str == undefined) {
    return "";
  }
  if (isNumber(str)) {
    return `${str}`;
  }
  // 匹配所有非字母、数字和汉字的特殊字符 /[^a-zA-Z0-9 ]/g
  const regex = /[^a-zA-Z0-9 \u4e00-\u9fa5]/g;
  if (isString(str)) {
    str = str.trim();
  }
  return str.replace(regex, "");
}

// 首字母转大写 使用charAt和toUpperCase
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

//使用正则表达式 删除HTML标签  以及  &nbsp;
export function removeHtmlTags(str: string) {
  str = str.replace(/(<([^>]+)>)/gi, ""); //去除HTML tag
  //str = str.replace(/<\/?[^>]*>/g, ""); //去除HTML tag
  //str = str.replace(/[ | ]*\n/g, "\n"); //去除行尾空白
  //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
  str = str.replace(/&nbsp;/gi, ""); //去掉&nbsp;
  return str;
}

//替换空内容为“-”
export function emptyTo_(str: string) {
  if(isEmpty(str)) {
    return "_";
  }
  return str;
}

//检测字符串str是否包含了数组arr里面的每个元素
export function containsAllElements(str, arr) {
  return arr.every(element => str.includes(element));
}

//整数转字符串日期
export function excelSerialToJSDate(excelDate) {
  //const baseDate = new Date(1900, 0, 1); // 2000-01-01
  //const targetDate = new Date(baseDate);
  //targetDate.setDate(baseDate.getDate() + excelDate - 1); // -1 是调整偏移
  //return targetDate;

  let result = "";
  try {
    // 修复后的Excel日期转换逻辑
    // Excel的日期系统从1900-01-01开始（Windows）
    // 使用更可靠的转换算法
    const excelEpoch = new Date(1900, 0, 1); // 基准日期
    const date = new Date(excelEpoch.getTime() + (excelDate * 24 * 60 * 60 * 1000));

    // 调整Excel的闰年错误（1900年不是闰年，但Excel认为是）
    if (excelDate >= 60) {
      date.setDate(date.getDate() - 1);
    }

    // 验证日期是否有效
    if (isNaN(date.getTime())) {
      throw new Error('转换后的日期无效');
    }

    // 格式化日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    result = `${year}/${month}/${day}`;
  } catch (error) {
    result = "";
  }
  return result;
}

//型号是否存在模式，存在则截取#之前的数据
export function getModelPrefix(model: string) {
  let m = {model: model, mode: -1};
  if(model.indexOf("#")>=0){
    let arr = model.split("#");
    m.model = arr[0];
    if(arr.length > 1){
      if(arr[1].indexOf("双模")>=0){
        m.mode = 3;
      }else{
        m.mode = arr[1].indexOf("RDSS")>=0 ? 1 : 2;
      }
    }
  }
  return m;
}
