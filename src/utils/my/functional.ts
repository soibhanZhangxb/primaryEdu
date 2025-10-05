/**
 * 解析二次函数字符串，支持分数系数，输出为小数形式（最多三项）
 */
export const parseQuadraticFunction = str => {
  if (typeof str !== "string") {
    throw new Error("输入必须是字符串");
  }

  // 清理字符串：移除空格
  const cleanStr = str.replace(/\s/g, "");
  let a = 0,
    b = 0,
    c = 0;

  // 解析数字（支持分数和小数）
  const parseNumber = numStr => {
    if (!numStr || numStr === "+" || numStr === "-") {
      return numStr === "-" ? -1 : 1;
    }

    // 处理带括号的分数，如 (2/3)
    if (numStr.startsWith("(") && numStr.endsWith(")")) {
      numStr = numStr.slice(1, -1); // 移除括号
    }

    // 处理分数形式 a/b
    if (numStr.includes("/")) {
      const [numerator, denominator] = numStr.split("/");
      const numValue = parseFloat(numerator);
      const denValue = parseFloat(denominator);

      if (denValue === 0) {
        return NaN; // 除零错误
      }

      return numValue / denValue;
    }

    // 处理小数或整数
    const value = parseFloat(numStr);
    return isNaN(value) ? 1 : value; // 如果解析失败，默认为1
  };

  // 改进的正则表达式，能正确匹配带括号的分数
  const termRegex = /([+-])?(\([^)]+\)|[^x]*)?(x²?|x)/g;

  let match;
  const terms = [];

  // 收集所有项
  while ((match = termRegex.exec(cleanStr)) !== null) {
    if (match[0]) {
      terms.push({
        sign: match[1] || "+",
        coefficient: match[2] || "",
        variable: match[3]
      });
    }

    // 防止死循环
    if (match.index === termRegex.lastIndex) {
      termRegex.lastIndex++;
    }
  }

  // 解析常数项（剩余的不含x的部分）
  const constantMatch = cleanStr.match(
    /([+-]?(?:\d*\.?\d*\/?\d*\.?\d*|\(\d*\.?\d*\/\d*\.?\d*\)))$/
  );
  if (constantMatch && constantMatch[0] && !constantMatch[0].includes("x")) {
    c = parseNumber(constantMatch[0]);
  }

  // 处理每个项
  terms.forEach(term => {
    const signMultiplier = term.sign === "-" ? -1 : 1;
    const coefficientValue = parseNumber(term.coefficient) * signMultiplier;

    if (!isNaN(coefficientValue)) {
      if (term.variable === "x²") {
        a += coefficientValue;
      } else if (term.variable === "x") {
        b += coefficientValue;
      }
    }
  });

  // 将系数转换为小数并保留3位
  const roundToThreeDecimals = value => {
    if (Math.abs(value) < 0.0001) return 0;
    return Math.round(value * 10000) / 10000;
  };

  const roundedA = roundToThreeDecimals(a);
  const roundedB = roundToThreeDecimals(b);
  const roundedC = roundToThreeDecimals(c);

  // 构建标准二次函数字符串
  const buildStandardForm = (a, b, c) => {
    const parts = [];

    // 格式化系数为字符串，保留3位小数
    const formatCoefficient = value => {
      if (Math.abs(value) < 0.0001) return "0";
      if (Number.isInteger(value)) return value.toString();
      return value.toFixed(3).replace(/\.?0+$/, "");
    };

    const aFormatted = formatCoefficient(a);
    const bFormatted = formatCoefficient(b);
    const cFormatted = formatCoefficient(c);

    // 二次项
    if (a !== 0) {
      if (aFormatted === "1") {
        parts.push("x²");
      } else if (aFormatted === "-1") {
        parts.push("-x²");
      } else {
        parts.push(`${aFormatted}x²`);
      }
    }

    // 一次项
    if (b !== 0) {
      let prefix = "";
      if (b > 0 && parts.length > 0) prefix = "+";

      if (bFormatted === "1") {
        parts.push(`${prefix}x`);
      } else if (bFormatted === "-1") {
        parts.push("-x");
      } else {
        parts.push(`${prefix}${bFormatted}x`);
      }
    }

    // 常数项
    if (c !== 0) {
      let prefix = "";
      if (c > 0 && parts.length > 0) prefix = "+";
      parts.push(`${prefix}${cFormatted}`);
    }

    return parts.length > 0 ? parts.join("") : "0";
  };

  const standardForm = buildStandardForm(roundedA, roundedB, roundedC);

  return {
    isQuadratic: roundedA !== 0,
    a: roundedA,
    b: roundedB,
    c: roundedC,
    f: standardForm,
    functionString: `f(x) = ${standardForm}`
  };
};

/*
// 测试用例
const testCases = [
  "-(2/3)x²-(4/3)x+2", // 主要问题案例
  "-0.56x² + 2x + 1",
  "x² + 2x + 1",
  "3x² - x + 5",
  "x² - 4",
  "2x² + 3x",
  "x²",
  "2x + 1",
  "5",
  "-x² + x - 1",
  "(1/2)x² + (1/3)x - 1/4", // 带括号的分数
  "2/3x² - 1/2x + 5" // 无括号分数
];

console.log("=== 修复NaN问题的二次函数解析器测试 ===\n");
testCases.forEach((test, index) => {
  try {
    const result = parseQuadraticFunction(test);
    console.log(`测试 ${index + 1}: "${test}"`);
    console.log(`  是否为二次函数: ${result.isQuadratic}`);
    console.log(
      `  系数: a=${result.coefficients.a}, b=${result.coefficients.b}, c=${result.coefficients.c}`
    );
    console.log(`  标准形式: ${result.standardForm}`);
    console.log(`  函数表达式: ${result.functionString}`);

    // 检查是否有NaN
    if (
      isNaN(result.coefficients.a) ||
      isNaN(result.coefficients.b) ||
      isNaN(result.coefficients.c)
    ) {
      console.log(`  ⚠️ 警告: 检测到NaN值!`);
    }

    console.log("---");
  } catch (error) {
    console.log(`测试 ${index + 1}: "${test}"`);
    console.log(`  错误: ${error.message}`);
    console.log("---");
  }
});

// 使用示例函数
function checkQuadraticFunction(str) {
  try {
    const result = parseQuadraticFunction(str);

    if (result.isQuadratic) {
      return `✅ 这是一个二次函数: ${result.functionString}`;
    } else {
      return `❌ 这不是一个二次函数 (缺少二次项)。解析为: ${result.functionString}`;
    }
  } catch (error) {
    return `❌ 解析错误: ${error.message}`;
  }
}

// 测试您提到的具体问题
console.log("\n=== 具体问题测试 ===");
console.log(checkQuadraticFunction("-(2/3)x²-(4/3)x+2"));
*/

/**
 * 解析一次函数字符串，支持分数系数，输出为小数形式（最多二项，多了丢弃）
 */
export const parseLineFunction = str => {
  // 1. 去除空格，分割等号
  str = str.replace(/\s/g, "");
  const standardForm = str;

  const parseCoefficient = coefStr => {
    if (coefStr === "") {
      return 1;
    } else if (coefStr === "+") {
      return 1;
    } else if (coefStr === "-") {
      return -1;
    } else {
      return parseFraction(coefStr);
    }
  };

  const parseFraction = str => {
    // 使用正则表达式匹配所有小括号并删除
    str = str.replace(/[()]/g, "");
    if (str.includes("/")) {
      const [numerator, denominator] = str.split("/");
      return parseFloat(numerator) / parseFloat(denominator);
    } else {
      return parseFloat(str);
    }
  };

  // 如果右边是空，则返回0,0
  if (str === "") {
    return { k: 0, b: 0 };
  }

  const xIndex = str.indexOf("x");
  let xTerm = "";
  let constTerm = "";
  if (xIndex !== -1) {
    xTerm = str.substring(0, xIndex + 1);
    constTerm = str.substring(xIndex + 1);
  } else {
    constTerm = str;
  }

  let k = 0;
  let b = 0;

  // 解析xTerm
  if (xTerm) {
    const coefStr = xTerm.substring(0, xTerm.length - 1); // 去掉x
    k = parseCoefficient(coefStr);
  }

  // 解析constTerm
  if (constTerm) {
    b = parseFraction(constTerm);
  }

  // 将系数转换为小数并保留3位
  const roundToThreeDecimals = value => {
    if (Math.abs(value) < 0.0001) return 0;
    return Math.round(value * 10000) / 10000;
  };
  k = roundToThreeDecimals(k);
  b = roundToThreeDecimals(b);

  return { k, b, f: standardForm };
};
