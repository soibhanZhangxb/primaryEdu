/*
 * Date作为构造函数来实例化
 * new Date()
 * new Date(millisecond: number), 毫秒数，秒 X 1000
 * new Date(dateString), 该字符串应该能被 Date.parse() 正确方法识别
 * new Date(year, monthIndex [, day [, hours [, minutes [, seconds [, milliseconds]]]]])
 *
 * Date.parse(dateString: string) 静态函数，返回该日期与 1970 年 1 月 1 日午夜之间相差的毫秒数
 *  dateString 短日期可使用/日期分隔符，但是必须符合"月/日/年"的格式
 *   yyyy-MM-dd HH:mm:ss
 */
import { dayjs } from "@/utils/utils";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

//用于判断一个值是否为有效的 Excel 日期格式（即正整数）
function isExcelDate(num) {
  return typeof num === "number" && num > 0;
}

//将 Excel 日期数字转换为 dayjs 对象，同时处理了 Excel 把 1900 年当成闰年多算一天的小错误。
function convertExcelDateToDayjs(num) {
  const baseDate = dayjs("1900-01-01");
  // Excel 有个小 bug，把 1900 年当成闰年，多算了一天
  const offset = num >= 61 ? 2 : 1;
  return baseDate.add(num - offset, "day");
}

/**
 * 断输入字符串是否为日期区间，并且兼容各种日期输入格式，包括 Excel 的数字日期格式（Excel 日期是自 1900 年 1 月 1 日起的天数），
 * 可以使用 dayjs 库来处理日期的解析和验证。以下是实现该功能的代码：
 * // 测试不同格式的日期区间
 *   const testCases = [
 *     "2024/1/21-2014/11/2",
 *     "2023/07/09-2024-06/01",
 *     "44927~45292", // Excel 日期格式
 *     "not a date range",
 *     "2024年11月2日",
 *     "—",
 *     "——",
 *     "/",
 *     "12个月",
 *     "01/01/2023 - 12/31/2023",
 *     "200/07/24-2023/09/30",
 *     "2000/00/00",
 *     "2018/11/17-2019/11/23",
 *     "2018/12/2-2020/4/4",
 *     "2020/05/10-2021/11/06",
 *     "2020/11/01-2021/11/01",
 *     "2099/11/30-2099/11/30",
 *     "装备故障"
 *   ];
 *   testCases.forEach(testCase => {
 *     console.log(`${testCase}  ==> ${isDateRange(testCase)}`);
 *   });
 */
export function isDateRange(str) {
  if (typeof str !== "string") return false;
  if (typeof str === "string") {
    //删除字符串里面的空格、回车换行
    str = str.replace(/[\s\n\r]+/g, "");
  }
  const separators = ["/", "-", "~"];
  let start, end;
  for (const separator of separators) {
    const parts = str.split(separator);
    if (parts.length === 2) {
      [start, end] = parts;
      break;
    }
  }
  if (!start || !end) {
    return false;
  }
  let startDate, endDate;
  if (isExcelDate(Number(start)) && isExcelDate(Number(end))) {
    startDate = convertExcelDateToDayjs(Number(start));
    endDate = convertExcelDateToDayjs(Number(end));
  } else {
    const commonFormats = [
      "YYYY-MM-DD",
      "YYYY-M-D",
      "YYYY/MM/DD",
      "YYYY/M/DD",
      "YYYY/MM/D",
      "YYYY/M/D",
      "YYYY.MM.DD",
      "YYYY.M.D",
      "MM-DD-YYYY",
      "MM/DD/YYYY",
      "DD-MM-YYYY",
      "D-M-YYYY",
      "DD/MM/YYYY",
      "D/M/YYYY",
      "YYYY年MM月DD日"
    ];
    startDate = dayjs(start, commonFormats, true);
    endDate = dayjs(end, commonFormats, true);
  }
  if (startDate.isValid() && endDate.isValid() && endDate.isBefore(startDate)) {
    let tmp = startDate;
    (startDate = endDate), (endDate = tmp);
  }

  if (
    (startDate.isValid() && endDate.isValid() && startDate.isBefore(endDate)) ||
    startDate.isSame(endDate)
  ) {
    return startDate.format("YYYY/MM/DD") + "-" + endDate.format("YYYY/MM/DD");
  }
  return false;
}

export function diffMonths(dateBegin: string, dateEnd: string) {
  // 使用Day.js解析日期
  const date1 = dayjs(dateBegin);
  const date2 = dayjs(dateEnd);
  // 计算月份差
  const monthsDiff = date2.diff(date1, "months");
  return monthsDiff;
}

export function dformat(date: Date, fmt: string) {
  let o = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "H+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  }
  return fmt;
}
/**
 * GMT时间转换为 正常北京时间(string类型)
 * @param date
 * @param format
 * @constructor
 */
export function dateToStr(date: Date, format?: string) {
  if (date == undefined) return "";
  if (format == undefined) format = "yyyy/MM/dd";
  return dformat(date, format);
}

/**
 * @description 两个GMT时间转换为 正常北京时间(string类型)
 * @param date,date2
 * @param format
 * @return 返回字符串日期
 */
export function datesToStr(date: Date, date2: Date, format?: string) {
  if (date == undefined) return "";
  if (format == undefined) format = "yyyy/MM/dd";
  return dformat(date, format) + "-" + dformat(date2, format);
}

/**
 * @description 时间戳转字符串
 * @param timestamp
 * @param format
 * @return 返回字符串日期
 */
export function timestampToStr(timestamp: number, format?: string) {
  if (timestamp == undefined || timestamp == null || timestamp == 0) {
    return "";
  }
  if (format == undefined) format = "yyyy/MM/dd";
  let date = new Date(timestamp);
  return dformat(date, format);
}

export function timestampsToStr(
  timestamp: number,
  timestamp2: number,
  format?: string
) {
  if (timestamp == undefined || timestamp == 0) {
    return "";
  }
  if (format == undefined) format = "yyyy/MM/dd";
  let date = new Date(timestamp);
  let date2 = new Date(timestamp2);
  return dformat(date, format) + "-" + dformat(date2, format);
}

/**
 * 字符串转时间戳,以秒为单位
 */
export function strToTimestamp(strDate: string) {
  let date = new Date(strDate); // 时间对象,例如 "2014-07-10 10:21:12"
  let timestamp: number = date.getTime(); //转换成时间戳
  timestamp = timestamp / 1000;
  return timestamp;
}

/**
 * string类型转date, 格式一般 2024-03-12
 * @param date
 * @return 字符串
 */
export function strToDate(strDate: string) {
  return Date.parse(strDate);
}

/*
 * 两个时间戳相差天数
 */
export function dateMinus(timestamp: number, timestamp2: number) {
  //timestamp:小日期 timestamp2:大日期
  let sdate = new Date(timestamp);
  let now = new Date(timestamp2);
  let days = (now.getTime() - sdate.getTime()) / (1000 * 60 * 60 * 24);
  let day = Math.floor(days);
  return day < 0 ? 0 : day;
}

/**
 * 获取最近一年的12个月: 09,08,07,06,05,04,03,02,01,12,11,10
 */
export function get12Months(date: Date = new Date(), isMonth: boolean = true) {
  let dataArr = [];
  date.setMonth(date.getMonth() + 1, 1); //获取到当前月份,设置月份
  for (let i = 0; i < 12; i++) {
    date.setMonth(date.getMonth() - 1); //每次循环一次 月份值减1
    let m = date.getMonth() + 1;
    if (isMonth) {
      dataArr.push(m < 10 ? `0${m}` : `${m}`);
    } else {
      let year = date.getFullYear();
      dataArr.push(m < 10 ? `${year}-0${m}` : `${year}-${m}`);
    }
  }
  return dataArr.reverse();
}
//
export function getMonthsFromRange(sdate: string[], isMonth: boolean = true) {
  let dataArr = [];
  let date: Date = new Date(`${sdate[1]}-01`);
  date.setMonth(date.getMonth() + 1, 1); //获取到当前月份,设置月份
  while (true) {
    date.setMonth(date.getMonth() - 1); //每次循环一次 月份值减1
    let m = date.getMonth() + 1;
    if (isMonth) {
      dataArr.push(m < 10 ? `0${m}` : `${m}`);
    } else {
      let year = date.getFullYear();
      dataArr.push(m < 10 ? `${year}-0${m}` : `${year}-${m}`);
    }
    let curYearMonth = dateToStr(date, "yyyy-MM");
    if (curYearMonth == sdate[0]) {
      break;
    }
  }
  return dataArr.reverse();
}
/*获取年份*/
export function getYear(year: number) {
  let date = new Date(); // 时间对象,例如 "2014-07-10 10:21:12"
  if (year != 0) {
    date = dayjs(date).add(year, "year").toDate();
  }
  return dateToStr(date, "yyyy");
}
export function addMonths(strDate: string, months: number) {
  let date = new Date(strDate); // 时间对象,例如 "2014-07-10 10:21:12"
  date = dayjs(date).add(months, "month").toDate();
  return dateToStr(date);
}
