/**
 * JavaScript 常用工具函数库
 */
// kutils.js
//import Konva from "konva";

const DUtils = {
  /**
   * 绘制x,y轴，刻度、刻度标签，网格背景
   * @param {number} width 舞台宽度
   * @param {number} height 舞台高度
   * @param {object} origin 舞台中心点{x,y}
   * @param {number} scale 网格线间隔像素数
   */
  drawGrid: (
    width: number,
    height: number,
    origin: { x: number; y: number },
    scale: number
  ) => {
    //if (!showGrid) return [];
    //网格，刻度，刻度标签
    const obj = { lines: [], labels: [] };
    const stepsX = Math.ceil(width / scale) + 1;
    const stepsY = Math.ceil(height / scale) + 1;
    const gcolor = "#aaa";

    // Y轴 和 垂直网格线
    for (let i = -stepsX; i <= stepsX; i++) {
      const x = origin.x + i * scale;
      obj.lines.push({
        points: [x, 0, x, height],
        stroke: i === 0 ? "#888" : "#ddd",
        strokeWidth: i === 0 ? 2 : 1
      });
      //x轴刻度
      obj.lines.push({
        points: [x, origin.y, x, origin.y - 8],
        stroke: gcolor,
        strokeWidth: 2
      });
      //x轴刻度的标签
      obj.labels.push({
        x: i != 0 ? x - 5 : x + 4,
        y: origin.y + 10,
        text: i,
        fontSize: 13,
        fill: gcolor
      });
    }
    // x轴 和 水平网格线
    for (let i = -stepsY; i <= stepsY; i++) {
      const y = origin.y + i * scale;
      obj.lines.push({
        points: [0, y, width, y],
        stroke: i === 0 ? "#888" : "#ddd",
        strokeWidth: i === 0 ? 2 : 1
      });
      //y轴刻度
      obj.lines.push({
        points: [origin.x, y, origin.x + 8, y],
        stroke: gcolor,
        strokeWidth: 2
      });
      //y轴刻度的标签
      if (i != 0) {
        obj.labels.push({
          x: origin.x + 15,
          y: y - 5,
          text: -i,
          fontSize: 13,
          fill: gcolor
        });
      }
    }
    //x轴，y轴的 x,y
    obj.labels.push({
      x: width - 20,
      y: origin.y - 20,
      text: "x",
      fontSize: 18,
      fill: gcolor
    });
    obj.labels.push({
      x: origin.x + 10,
      y: 20,
      text: "y",
      fontSize: 18,
      fill: gcolor
    });

    // x轴箭头, y轴箭头
    obj.lines.push({
      points: [
        width - 10,
        origin.y - 5,
        width,
        origin.y,
        width - 10,
        origin.y + 5
      ],
      stroke: "#1e293b",
      strokeWidth: 2,
      closed: true,
      fill: "#1e293b"
    });
    obj.lines.push({
      points: [origin.x - 5, 10, origin.x, 0, origin.x + 5, 10],
      stroke: "#1e293b",
      strokeWidth: 2,
      closed: true,
      fill: "#1e293b"
    });

    return obj;
  }
};

export default DUtils;
