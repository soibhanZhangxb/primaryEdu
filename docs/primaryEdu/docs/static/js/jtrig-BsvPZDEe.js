import { useColumns as m } from "./columns-Bi4kaVRp.js";
import {
  d,
  b as p,
  e as f,
  w as t,
  f as o,
  h as s,
  j as n,
  u as b,
  g as a,
  _ as v
} from "./index-ifxKUhWa.js";
const g = d({
    name: "JTrig4",
    __name: "jtrig",
    setup(k) {
      const { columns: r } = m();
      return (w, e) => {
        const l = s("el-link"),
          u = s("el-button"),
          c = s("el-result"),
          _ = s("PureDescriptions"),
          i = s("el-card");
        return (
          f(),
          p(
            i,
            { shadow: "never" },
            {
              header: t(() => [
                e[1] ||
                  (e[1] = a(
                    "div",
                    { class: "card-header" },
                    [a("span", { class: "font-medium" }, "失败页")],
                    -1
                  )),
                o(
                  l,
                  {
                    class: "mt-2",
                    href: "https://github.com/pure-admin/vue-pure-admin/blob/main/src/views/result/fail.vue",
                    target: "_blank"
                  },
                  {
                    default: t(
                      () =>
                        e[0] ||
                        (e[0] = [n(" 代码位置 src/views/result/fail.vue ")])
                    ),
                    _: 1,
                    __: [0]
                  }
                )
              ]),
              default: t(() => [
                o(
                  c,
                  {
                    icon: "error",
                    title: "提交失败",
                    "sub-title": "请核对并修改以下信息后，再重新提交。"
                  },
                  {
                    extra: t(() => [
                      o(
                        u,
                        { type: "primary" },
                        {
                          default: t(() => e[2] || (e[2] = [n("返回修改")])),
                          _: 1,
                          __: [2]
                        }
                      )
                    ]),
                    _: 1
                  }
                ),
                o(
                  _,
                  {
                    columns: b(r),
                    title: "您提交的内容有如下错误：",
                    class: "p-6 w-[90%] m-auto bg-[#fafafa] dark:bg-[#1d1d1d]"
                  },
                  null,
                  8,
                  ["columns"]
                )
              ]),
              _: 1
            }
          )
        );
      };
    }
  }),
  h = v(g, [["__scopeId", "data-v-3af0c35a"]]);
export { h as default };
