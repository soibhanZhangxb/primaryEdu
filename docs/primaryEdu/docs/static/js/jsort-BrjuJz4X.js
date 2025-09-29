var K = Object.defineProperty,
  Q = Object.defineProperties;
var Z = Object.getOwnPropertyDescriptors;
var A = Object.getOwnPropertySymbols;
var ee = Object.prototype.hasOwnProperty,
  te = Object.prototype.propertyIsEnumerable;
var P = (g, r, i) =>
    r in g
      ? K(g, r, { enumerable: !0, configurable: !0, writable: !0, value: i })
      : (g[r] = i),
  j = (g, r) => {
    for (var i in r || (r = {})) ee.call(r, i) && P(g, i, r[i]);
    if (A) for (var i of A(r)) te.call(r, i) && P(g, i, r[i]);
    return g;
  },
  N = (g, r) => Q(g, Z(r));
import {
  d as oe,
  r as T,
  a as x,
  k as b,
  e as y,
  f as s,
  g as B,
  w as v,
  h as c,
  j as U,
  F as X,
  l as S,
  b as $,
  dq as ne,
  _ as le
} from "./index-ifxKUhWa.js";
const ae = { class: "sorting-demo-container" },
  se = { class: "canvas-container" },
  re = oe({
    __name: "jsort",
    setup(g) {
      const r = T({ width: 600, height: 400 }),
        i = x(5),
        w = x("asc"),
        k = x(500),
        p = x(!1),
        u = x([]),
        M = [
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#FFA07A",
          "#98D8C8",
          "#F06292",
          "#7986CB",
          "#9575CD",
          "#64B5F6",
          "#4DB6AC",
          "#81C784",
          "#FFD54F"
        ],
        I = () => {
          const t = [];
          for (let l = 0; l < i.value; l++) {
            const d = Math.floor(Math.random() * 90) + 10,
              f = d * 2;
            t.push({
              id: `item-${l}`,
              value: d,
              height: f,
              x: 100 + l * 60,
              y: 300 - f,
              originalX: 100 + l * 60,
              color: M[l % M.length],
              order: l
            });
          }
          u.value = t;
        },
        E = () => {
          if (p.value) {
            ne.warning("请等待排序动画完成");
            return;
          }
          I();
        },
        q = () => {
          if (p.value) return;
          p.value = !0;
          let t = [...u.value];
          w.value === "asc"
            ? t.sort((n, l) => n.value - l.value)
            : w.value === "desc" && t.sort((n, l) => l.value - n.value),
            O(t);
        },
        O = t => {
          const n = k.value,
            l = Date.now(),
            d = u.value.reduce(
              (o, a) => ((o[a.id] = { x: a.x, y: a.y }), o),
              {}
            ),
            f = {};
          t.forEach((o, a) => {
            f[o.id] = { x: 100 + a * 60, y: o.y };
          });
          const m = () => {
            const o = Date.now() - l,
              a = Math.min(o / n, 1);
            u.value.forEach(h => {
              const _ = d[h.id],
                D = f[h.id];
              _ && D && (h.x = _.x + (D.x - _.x) * a);
            }),
              a < 1
                ? requestAnimationFrame(m)
                : ((u.value = t.map((h, _) =>
                    N(j({}, h), {
                      x: 100 + _ * 60,
                      originalX: 100 + _ * 60,
                      order: _
                    })
                  )),
                  (p.value = !1));
          };
          m();
        },
        C = x(null),
        F = T({ x: 0, y: 0 }),
        W = t => {
          p.value || ((C.value = t), (F.x = t.x), (F.y = t.y));
        },
        Y = t => {
          p.value || (t.y = F.y);
        },
        z = () => {
          if (p.value || !C.value) return;
          const t = C.value,
            n = t.x;
          let l = Math.round((n - 100) / 60);
          l = Math.max(0, Math.min(u.value.length - 1, l));
          const d = 100 + l * 60;
          (t.x = d),
            (t.originalX = d),
            u.value
              .filter(o => o.id !== t.id)
              .sort((o, a) => o.originalX - a.originalX);
          let m = 0;
          for (let o = 0; o < u.value.length; o++) {
            if (u.value[o].id === t.id) continue;
            const a = 100 + m * 60;
            a >= d && m++, (u.value[o].x = a), (u.value[o].originalX = a), m++;
          }
          u.value.sort((o, a) => o.originalX - a.originalX), (C.value = null);
        };
      return (
        I(),
        (t, n) => {
          const l = c("el-slider"),
            d = c("el-form-item"),
            f = c("el-option"),
            m = c("el-select"),
            o = c("el-button"),
            a = c("el-form"),
            h = c("el-card"),
            _ = c("v-line"),
            D = c("v-group"),
            L = c("v-rect"),
            R = c("v-text"),
            G = c("v-layer"),
            H = c("v-stage");
          return (
            y(),
            b("div", ae, [
              s(
                h,
                { class: "control-panel" },
                {
                  header: v(
                    () =>
                      n[3] ||
                      (n[3] = [
                        B(
                          "div",
                          { class: "card-header" },
                          [B("span", null, "排序学习演示")],
                          -1
                        )
                      ])
                  ),
                  default: v(() => [
                    s(
                      a,
                      { "label-width": "100px" },
                      {
                        default: v(() => [
                          s(
                            d,
                            { label: "元素数量" },
                            {
                              default: v(() => [
                                s(
                                  l,
                                  {
                                    modelValue: i.value,
                                    "onUpdate:modelValue":
                                      n[0] || (n[0] = e => (i.value = e)),
                                    min: 3,
                                    max: 10,
                                    onChange: E
                                  },
                                  null,
                                  8,
                                  ["modelValue"]
                                )
                              ]),
                              _: 1
                            }
                          ),
                          s(
                            d,
                            { label: "排序类型" },
                            {
                              default: v(() => [
                                s(
                                  m,
                                  {
                                    modelValue: w.value,
                                    "onUpdate:modelValue":
                                      n[1] || (n[1] = e => (w.value = e)),
                                    placeholder: "请选择排序类型"
                                  },
                                  {
                                    default: v(() => [
                                      s(f, { label: "升序", value: "asc" }),
                                      s(f, { label: "降序", value: "desc" }),
                                      s(f, { label: "随机", value: "random" })
                                    ]),
                                    _: 1
                                  },
                                  8,
                                  ["modelValue"]
                                )
                              ]),
                              _: 1
                            }
                          ),
                          s(
                            d,
                            { label: "动画速度" },
                            {
                              default: v(() => [
                                s(
                                  l,
                                  {
                                    modelValue: k.value,
                                    "onUpdate:modelValue":
                                      n[2] || (n[2] = e => (k.value = e)),
                                    min: 100,
                                    max: 1e3,
                                    step: 100
                                  },
                                  null,
                                  8,
                                  ["modelValue"]
                                )
                              ]),
                              _: 1
                            }
                          ),
                          s(
                            o,
                            { type: "primary", onClick: q },
                            {
                              default: v(
                                () => n[4] || (n[4] = [U("开始排序")])
                              ),
                              _: 1,
                              __: [4]
                            }
                          ),
                          s(
                            o,
                            { onClick: E },
                            {
                              default: v(() => n[5] || (n[5] = [U("重置")])),
                              _: 1,
                              __: [5]
                            }
                          )
                        ]),
                        _: 1
                      }
                    )
                  ]),
                  _: 1
                }
              ),
              B("div", se, [
                s(
                  H,
                  { ref: "stage", config: r, onDragend: z },
                  {
                    default: v(() => [
                      s(
                        G,
                        { ref: "layer" },
                        {
                          default: v(() => [
                            (y(),
                            b(
                              X,
                              null,
                              S(10, e =>
                                s(
                                  D,
                                  { key: "grid-x-" + e },
                                  {
                                    default: v(() => [
                                      s(
                                        _,
                                        {
                                          config: {
                                            points: [e * 60, 0, e * 60, 600],
                                            stroke: "#eee",
                                            strokeWidth: 1
                                          }
                                        },
                                        null,
                                        8,
                                        ["config"]
                                      ),
                                      s(
                                        _,
                                        {
                                          config: {
                                            points: [0, e * 60, 600, e * 60],
                                            stroke: "#eee",
                                            strokeWidth: 1
                                          }
                                        },
                                        null,
                                        8,
                                        ["config"]
                                      )
                                    ]),
                                    _: 2
                                  },
                                  1024
                                )
                              ),
                              64
                            )),
                            (y(!0),
                            b(
                              X,
                              null,
                              S(
                                u.value,
                                (e, V) => (
                                  y(),
                                  $(
                                    L,
                                    {
                                      key: "item-" + V,
                                      config: {
                                        x: e.x,
                                        y: e.y,
                                        width: 50,
                                        height: e.height,
                                        fill: e.color,
                                        shadowColor: "black",
                                        shadowBlur: 5,
                                        shadowOpacity: 0.3,
                                        shadowOffset: { x: 2, y: 2 },
                                        cornerRadius: 5,
                                        draggable: !0,
                                        id: e.id
                                      },
                                      onDragstart: J => W(e),
                                      onDragmove: J => Y(e)
                                    },
                                    null,
                                    8,
                                    ["config", "onDragstart", "onDragmove"]
                                  )
                                )
                              ),
                              128
                            )),
                            (y(!0),
                            b(
                              X,
                              null,
                              S(
                                u.value,
                                (e, V) => (
                                  y(),
                                  $(
                                    R,
                                    {
                                      key: "text-" + V,
                                      config: {
                                        x: e.x + 25,
                                        y: e.y + e.height + 10,
                                        text: e.value.toString(),
                                        fontSize: 20,
                                        fill: "#333",
                                        align: "center",
                                        width: 50
                                      }
                                    },
                                    null,
                                    8,
                                    ["config"]
                                  )
                                )
                              ),
                              128
                            ))
                          ]),
                          _: 1
                        },
                        512
                      )
                    ]),
                    _: 1
                  },
                  8,
                  ["config"]
                )
              ])
            ])
          );
        }
      );
    }
  }),
  ce = le(re, [["__scopeId", "data-v-e1f48a8f"]]);
export { ce as default };
