var k = Object.defineProperty,
  w = Object.defineProperties;
var N = Object.getOwnPropertyDescriptors;
var x = Object.getOwnPropertySymbols;
var R = Object.prototype.hasOwnProperty,
  z = Object.prototype.propertyIsEnumerable;
var p = (o, e, t) =>
    e in o
      ? k(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
      : (o[e] = t),
  _ = (o, e) => {
    for (var t in e || (e = {})) R.call(e, t) && p(o, t, e[t]);
    if (x) for (var t of x(e)) z.call(e, t) && p(o, t, e[t]);
    return o;
  },
  v = (o, e) => w(o, N(e));
import {
  d as B,
  a,
  m as S,
  n as h,
  b as W,
  e as F,
  w as T,
  f as m,
  h as u,
  x as K
} from "./index-ifxKUhWa.js";
const M = B({
  name: "KTextWithBg",
  __name: "KTextWithBg",
  props: {
    text: {},
    x: { default: 0 },
    y: { default: 0 },
    fontSize: { default: 16 },
    fontFamily: { default: "Arial" },
    textColor: { default: "#333" },
    bgColor: { default: "#f0f0f0" },
    padding: { default: 5 },
    cornerRadius: { default: 5 }
  },
  setup(o, { expose: e }) {
    const t = o,
      i = a({ x: t.x, y: t.y }),
      g = a({
        text: t.text,
        fontSize: t.fontSize,
        fontFamily: t.fontFamily,
        fill: t.textColor,
        padding: t.padding
      }),
      y = a({
        fill: t.bgColor,
        cornerRadius: t.cornerRadius,
        stroke: "#ccc",
        strokeWidth: 1
      }),
      c = a(null),
      l = a(null),
      d = () => {
        K(() => {
          if (!l.value || !c.value) return;
          const n = l.value.getNode(),
            f = c.value.getNode(),
            s = n.width(),
            r = n.height();
          f.width(s + t.padding * 2),
            f.height(r + t.padding * 2),
            n.x(t.padding),
            n.y(t.padding);
        });
      },
      C = () => {
        i.value = v(_({}, i.value), { x: t.x, y: t.y });
      };
    return (
      S(() => {
        d();
      }),
      h(
        () => t.text,
        n => {
          (g.value.text = n), d();
        }
      ),
      h(
        () => [t.x, t.y],
        () => {
          C();
        }
      ),
      e({ updateSize: d }),
      (n, f) => {
        const s = u("v-rect"),
          r = u("v-text"),
          b = u("v-group");
        return (
          F(),
          W(
            b,
            { config: i.value },
            {
              default: T(() => [
                m(s, { ref_key: "bgRect", ref: c, config: y.value }, null, 8, [
                  "config"
                ]),
                m(
                  r,
                  { ref_key: "textNode", ref: l, config: g.value },
                  null,
                  8,
                  ["config"]
                )
              ]),
              _: 1
            },
            8,
            ["config"]
          )
        );
      }
    );
  }
});
export { M as _ };
