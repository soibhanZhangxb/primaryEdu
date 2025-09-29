import l from "./Base-DxbQUKnI.js";
import a from "./Step-0Q_7iDzT.js";
import p from "./Size-D2Gx0dZh.js";
import f from "./Input-Du3EFmxY.js";
import v from "./Range-DMeLgmSA.js";
import u from "./Marks-Chq8s6pH.js";
import b from "./Vertical-D8SkQAsE.js";
import x from "./Placement-Bx7-i3JB.js";
import {
  d as k,
  b as _,
  e as w,
  w as m,
  g as o,
  f as e,
  u as r,
  h as i,
  j as g
} from "./index-ifxKUhWa.js";
const B = { class: "card-header" },
  c = k({
    name: "PureSlider",
    __name: "index",
    setup(V) {
      return (C, s) => {
        const n = i("el-link"),
          t = i("el-divider"),
          d = i("el-card");
        return (
          w(),
          _(
            d,
            { shadow: "never" },
            {
              header: m(() => [
                o("div", B, [
                  s[1] || (s[1] = o("p", { class: "font-medium" }, "滑块", -1)),
                  e(
                    n,
                    {
                      class: "mt-2",
                      href: "https://github.com/pure-admin/vue-pure-admin/blob/main/src/views/components/slider/index.vue",
                      target: "_blank"
                    },
                    {
                      default: m(
                        () =>
                          s[0] ||
                          (s[0] = [
                            g(
                              " 代码位置 src/views/components/slider/index.vue "
                            )
                          ])
                      ),
                      _: 1,
                      __: [0]
                    }
                  )
                ])
              ]),
              default: m(() => [
                s[2] || (s[2] = o("div", { class: "mb-2" }, "基础用法", -1)),
                e(r(l)),
                e(t),
                s[3] || (s[3] = o("div", { class: "mb-2" }, "离散值", -1)),
                e(r(a)),
                e(t),
                s[4] ||
                  (s[4] = o("div", { class: "mb-2" }, "带有输入框的滑块", -1)),
                e(r(f)),
                e(t),
                s[5] || (s[5] = o("div", { class: "mb-2" }, "不同尺寸", -1)),
                e(r(p)),
                e(t),
                s[6] || (s[6] = o("div", { class: "mb-2" }, "位置", -1)),
                e(r(x)),
                e(t),
                s[7] || (s[7] = o("div", { class: "mb-2" }, "范围选择", -1)),
                e(r(v)),
                e(t),
                s[8] || (s[8] = o("div", { class: "mb-2" }, "垂直模式", -1)),
                e(r(b)),
                e(t),
                s[9] || (s[9] = o("div", { class: "mb-2" }, "显示标记", -1)),
                e(r(u), { class: "mb-6" })
              ]),
              _: 1,
              __: [2, 3, 4, 5, 6, 7, 8, 9]
            }
          )
        );
      };
    }
  });
export { c as default };
