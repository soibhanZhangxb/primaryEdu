/**
 * JavaScript 常用工具函数库
 */
// kutils.js
import Konva from "konva";

const KUtils = {
  // ================== 对象相关 ==================
  /**
   * 绘制背景网格
   * @param {number} width 舞台宽度
   * @param {number} height 舞台高度
   * @param {object} origin 舞台中心点{x,y}
   * @param {number} scale 网格线间隔像素数
   * @param {Layer} bgLayer 绘制网格的图层
   */
  drawGrid(
    width: number,
    height: number,
    origin: { x: number; y: number },
    scale: number,
    bgLayer: Konva.Layer
  ) {
    bgLayer.removeChildren();

    // 1) 创建一个矩形到layer
    const grid = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: "#f8fafc"
    });
    bgLayer.add(grid);

    // 2) 添加水平线到layer
    for (let y = origin.y % scale; y < height; y += scale) {
      const line = new Konva.Line({
        points: [0, y, width, y],
        stroke: "#e5e7eb",
        strokeWidth: 1
      });
      bgLayer.add(line);
    }
    // 3) 添加垂直线到layer
    for (let x = origin.x % scale; x < width; x += scale) {
      const line = new Konva.Line({
        points: [x, 0, x, height],
        stroke: "#e5e7eb",
        strokeWidth: 1
      });
      bgLayer.add(line);
    }
    bgLayer.draw();
  },

  /**
   * 绘制坐标轴 刻度和标签
   * @param {number} width 画布宽度
   * @param {number} height 画布高度
   * @param {object} origin 坐标轴原点 {x,y}
   * @param {number} scale 刻度比例
   * @param {number} maxTicks 刻度最大值
   * @param {number} tickSize 为刻度的长度
   * @param {Konva.Layer} axisLayer 轴图层
   */
  drawAxes(
    width: number,
    height: number,
    origin: { x: number; y: number },
    scale: number,
    maxTicks: number,
    tickSize: number,
    axisLayer: Konva.Layer
  ) {
    axisLayer.removeChildren();
    // x轴, y轴
    const _style = {
      stroke: "#1e293b",
      strokeWidth: 2,
      lineCap: "round",
      lineJoin: "round",
      closed: true,
      fill: "#1e293b"
    };
    const xAxis = new Konva.Line(
      Object.assign(_style, {
        points: [0, origin.y, width, origin.y]
      }) as Konva.LineConfig
    );
    const yAxis = new Konva.Line(
      Object.assign(_style, {
        points: [origin.x, 0, origin.x, height]
      }) as Konva.LineConfig
    );
    axisLayer.add(xAxis);
    axisLayer.add(yAxis);

    // x轴箭头, y轴箭头
    const _style2 = {
      stroke: "#1e293b",
      strokeWidth: 2,
      closed: true,
      fill: "#1e293b"
    };
    const xArrow = new Konva.Line(
      Object.assign(_style2, {
        points: [
          width - 10,
          origin.y - 5,
          width,
          origin.y,
          width - 10,
          origin.y + 5
        ]
      })
    );
    const yArrow = new Konva.Line(
      Object.assign(_style2, {
        points: [origin.x - 5, 10, origin.x, 0, origin.x + 5, 10]
      })
    );
    axisLayer.add(xArrow);
    axisLayer.add(yArrow);

    // x轴标签, y轴标签
    const _style3 = { fontSize: 16, fontFamily: "Arial", fill: "#1e293b" };
    const xLabel = new Konva.Text(
      Object.assign(_style3, { x: width - 20, y: origin.y + 15, text: "x" })
    );
    const yLabel = new Konva.Text(
      Object.assign(_style3, { x: origin.x + 10, y: 15, text: "y" })
    );
    axisLayer.add(xLabel);
    axisLayer.add(yLabel);

    // x轴方向刻度 和 y轴刻度
    for (let i = -maxTicks; i <= maxTicks; i++) {
      const x = origin.x + i * scale;
      const y = origin.y + i * scale;
      if (i == 0) {
        //圆点标签
        const originLabel = new Konva.Text({
          x: origin.x + 5,
          y: origin.y + 5,
          text: "O",
          fontSize: 14,
          fontFamily: "Arial",
          fill: "#1e293b"
        });
        axisLayer.add(originLabel);
        continue;
      }
      if (x >= -width && x <= width) {
        // 刻度线和刻度标签
        const tick = new Konva.Line({
          points: [x, origin.y - tickSize / 2, x, origin.y + tickSize / 2],
          stroke: "#1e293b",
          strokeWidth: 2
        });
        const label = new Konva.Text({
          x: x - 5,
          y: origin.y + 15,
          text: i.toString(),
          fontSize: 12,
          fontFamily: "Arial",
          fill: "#1e293b"
        });
        axisLayer.add(tick);
        axisLayer.add(label);
      }
      // y轴方向刻度
      if (y >= -height && y <= height) {
        // 刻度线, 刻度标签
        const tick = new Konva.Line({
          points: [origin.x - tickSize / 2, y, origin.x + tickSize / 2, y],
          stroke: "#1e293b",
          strokeWidth: 2
        });
        const label = new Konva.Text({
          x: origin.x + 10,
          y: y - 5,
          text: (-i).toString(),
          fontSize: 12,
          fontFamily: "Arial",
          fill: "#1e293b"
        });
        axisLayer.add(tick);
        axisLayer.add(label);
      }
    }
    axisLayer.draw();
  },

  /**
   * 绘制线上的圆点
   * @param {*} x             位置圆点位置 x,y
   * @param {*} y
   * @param {*} fillColor     圆点颜色
   * @param {*} strokeColor   圆点颜色
   * @param {*} parentLayer   父级层
   */
  drawDotOfLine(
    x: number,
    y: number,
    fillColor: string,
    strokeColor: string,
    parentLayer: Konva.Layer
  ) {
    // 绘制y轴截距点
    const dot = new Konva.Circle({
      x: x,
      y: y,
      radius: 6,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
      shadowBlur: 5,
      shadowColor: strokeColor,
      shadowOpacity: 0.5,
      shadowOffset: { x: 0, y: 0 },
      draggable: false
    });
    parentLayer.add(dot);
  },

  /**
   *
   * @param {number} x             位置圆点位置 x,y
   * @param {number} y
   * @param {string} fillColor     标签颜色
   * @param {string} text       标签内容
   * @param {Konva.Layer} parentLayer   父级层
   */
  drawLabelOfLine(
    x: number,
    y: number,
    fillColor: string,
    text: string,
    parentLayer: Konva.Layer
  ) {
    // 根标签
    const label = new Konva.Label({ x, y });
    label.add(
      new Konva.Tag({ fill: fillColor, opacity: 0.8, cornerRadius: 5 })
    );
    label.add(
      new Konva.Text({
        text,
        fontFamily: "Arial",
        fontSize: 12,
        padding: 5,
        fill: "white"
      })
    );
    parentLayer.add(label);
  },

  /**
   * 绘制曲线, 线型蓝色，圆头，宽度为3，张力为0.5
   * @param points
   * @param parentLayer
   */
  drawFormulaLine(points: [number], parentLayer: Konva.Layer) {
    const line = new Konva.Line({
      points: points,
      stroke: "#3b82f6",
      strokeWidth: 3,
      tension: 0.5,
      lineCap: "round",
      lineJoin: "round"
    });
    parentLayer.add(line);
  }
};

// 导出工具对象,export是 ES6语法，载入的地方必须用
//<!-- 使用 type="module" 加载 utils.js -->
//<script type="module" src="./js/utils.js"></script>
export default KUtils;
