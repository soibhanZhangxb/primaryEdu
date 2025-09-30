import { T as c, E as f } from "./index.esm-DhKImP0r.js";
import {
  d as m,
  s as p,
  r as v,
  o as _,
  l as g,
  f as C,
  g as h,
  A as l,
  a as n
} from "./index-BxizvH50.js";
const x = { class: "wangeditor" },
  r = "default",
  b = m({
    name: "BaseEditor",
    __name: "EditorBase",
    setup(y) {
      const o = p(),
        t = v("<p>你好</p>");
      _(() => {
        setTimeout(() => {
          t.value = "<p>我是模拟的异步数据</p>";
        }, 1500);
      });
      const s = { excludeKeys: "fullScreen" },
        d = { placeholder: "请输入内容..." },
        u = e => {
          o.value = e;
        };
      return (
        g(() => {
          const e = o.value;
          e != null && e.destroy();
        }),
        (e, a) => (
          h(),
          C("div", x, [
            l(
              n(c),
              {
                editor: o.value,
                defaultConfig: s,
                mode: r,
                style: { "border-bottom": "1px solid #ccc" }
              },
              null,
              8,
              ["editor"]
            ),
            l(
              n(f),
              {
                modelValue: t.value,
                "onUpdate:modelValue": a[0] || (a[0] = i => (t.value = i)),
                defaultConfig: d,
                mode: r,
                style: { height: "500px", "overflow-y": "hidden" },
                onOnCreated: u
              },
              null,
              8,
              ["modelValue"]
            )
          ])
        )
      );
    }
  });
export { b as _ };
