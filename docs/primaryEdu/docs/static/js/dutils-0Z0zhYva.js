const u = {
  drawGrid: (o, x, s, p) => {
    const l = { lines: [], labels: [] },
      y = Math.ceil(o / p) + 1,
      f = Math.ceil(x / p) + 1;
    for (let t = -y; t <= y; t++) {
      const e = s.x + t * p;
      l.lines.push({
        points: [e, 0, e, x],
        stroke: t === 0 ? "#888" : "#ddd",
        strokeWidth: t === 0 ? 2 : 1
      }),
        l.lines.push({
          points: [e, s.y, e, s.y - 8],
          stroke: "#333",
          strokeWidth: 2
        }),
        l.labels.push({
          x: t != 0 ? e - 5 : e + 4,
          y: s.y + 10,
          text: t,
          fontSize: 13,
          fill: "#333"
        });
    }
    for (let t = -f; t <= f; t++) {
      const e = s.y + t * p;
      l.lines.push({
        points: [0, e, o, e],
        stroke: t === 0 ? "#888" : "#ddd",
        strokeWidth: t === 0 ? 2 : 1
      }),
        l.lines.push({
          points: [s.x, e, s.x + 8, e],
          stroke: "#333",
          strokeWidth: 2
        }),
        t != 0 &&
          l.labels.push({
            x: s.x + 15,
            y: e - 5,
            text: -t,
            fontSize: 13,
            fill: "#333"
          });
    }
    return (
      l.labels.push({
        x: o - 20,
        y: s.y - 20,
        text: "x",
        fontSize: 18,
        fill: "#000"
      }),
      l.labels.push({
        x: s.x + 10,
        y: 20,
        text: "y",
        fontSize: 18,
        fill: "#000"
      }),
      l.lines.push({
        points: [o - 10, s.y - 5, o, s.y, o - 10, s.y + 5],
        stroke: "#1e293b",
        strokeWidth: 2,
        closed: !0,
        fill: "#1e293b"
      }),
      l.lines.push({
        points: [s.x - 5, 10, s.x, 0, s.x + 5, 10],
        stroke: "#1e293b",
        strokeWidth: 2,
        closed: !0,
        fill: "#1e293b"
      }),
      l
    );
  }
};
export { u as D };
