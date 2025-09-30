/**
 * 判读字符串是否是二次函数
 */
export const parseQuadraticFunction = (str) => {
  // 清理字符串：移除空格，统一符号格式
  const cleanStr = str.replace(/\s/g, '').replace(/\+-/g, '-').replace(/--/g, '+');

  // 匹配二次项、一次项和常数项的正则表达式
  const quadraticRegex = /([+-]?\d*)x²|x²/g;
  const linearRegex = /([+-]?\d*)x(?!²)/g;
  const constantRegex = /([+-]?\d+)(?![x²])/g;

  let a = 0, b = 0, c = 0;

  // 解析二次项
  const quadraticMatch = quadraticRegex.exec(cleanStr);
  if (quadraticMatch) {
    if (quadraticMatch[1] === '' || quadraticMatch[1] === '+') {
      a = 1;
    } else if (quadraticMatch[1] === '-') {
      a = -1;
    } else {
      a = parseFloat(quadraticMatch[1]);
    }
  }

  // 解析一次项
  const linearMatch = linearRegex.exec(cleanStr);
  if (linearMatch) {
    if (linearMatch[1] === '' || linearMatch[1] === '+') {
      b = 1;
    } else if (linearMatch[1] === '-') {
      b = -1;
    } else {
      b = parseFloat(linearMatch[1]);
    }
  }

  // 解析常数项
  const constantMatch = constantRegex.exec(cleanStr);
  if (constantMatch) {
    c = parseFloat(constantMatch[1]);
  }

  // 构建标准二次函数字符串
  let result = '';

  // 二次项
  if (a !== 0) {
    if (a === 1) {
      result += 'x²';
    } else if (a === -1) {
      result += '-x²';
    } else {
      result += `${a}x²`;
    }
  }

  // 一次项
  if (b !== 0) {
    if (b > 0 && result !== '') {
      result += '+';
    }
    if (b === 1) {
      result += 'x';
    } else if (b === -1) {
      result += '-x';
    } else {
      result += `${b}x`;
    }
  }

  // 常数项
  if (c !== 0) {
    if (c > 0 && result !== '') {
      result += '+';
    }
    result += c;
  }

  // 如果所有系数都为0，返回默认格式
  if (result === '') {
    result = '0';
  }

  return {
    isQuadratic: a !== 0, // 只有二次项系数不为0才是真正的二次函数
    coefficients: { a, b, c },
    standardForm: result,
    functionString: `f(x) = ${result}`
  };
}
/*
// 测试用例
[
  "x² + 2x + 1",
  "3x² - x + 5",
  "x² - 4",
  "2x² + 3x",
  "x²",
  "2x + 1",  // 这不是二次函数
  "5",       // 这不是二次函数
  "-x² + x - 1",
  "x² - x² + x", // 二次项抵消，不是二次函数
  "2x² + 3x - x²" // 合并后为 x² + 3x
].forEach(test => {
  const result = parseQuadraticFunction(test);
  console.log(`输入: "${test}"`);
  console.log(`是否为二次函数: ${result.isQuadratic}`);
  console.log(`系数: a=${result.coefficients.a}, b=${result.coefficients.b}, c=${result.coefficients.c}`);
  console.log(`标准形式: ${result.standardForm}`);
  console.log(`函数表达式: ${result.functionString}`);
  console.log('---');
});
// 使用示例
function checkQuadraticFunction(str) {
  const result = parseQuadraticFunction(str);

  if (result.isQuadratic) {
    return `✅ 这是一个二次函数: ${result.functionString}`;
  } else {
    return `❌ 这不是一个二次函数 (缺少二次项)。解析为: ${result.functionString}`;
  }
}

// 示例使用
console.log(checkQuadraticFunction("x² + 2x + 1"));
console.log(checkQuadraticFunction("3x - 2"));
 */
