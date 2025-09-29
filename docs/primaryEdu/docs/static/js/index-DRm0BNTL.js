import { useColumns as m } from "./columns-B7ZDgO55.js";
import {
  d,
  h as t,
  b as p,
  e as f,
  w as s,
  f as o,
  j as n,
  u as b,
  g as a,
  _ as v
} from "./index-ifxKUhWa.js";
import "./arrow-right-s-line-BpZUWrkB.js";
import "./close-circle-line-B9LLiHdd.js";
const x = d({
    name: "Maths",
    __name: "index",
    setup(k) {
      const { columns: r } = m();
      return (w, e) => {
        const l = t("el-link"),
          u = t("el-button"),
          i = t("el-result"),
          _ = t("PureDescriptions"),
          c = t("el-card");
        return (
          f(),
          p(
            c,
            { shadow: "never" },
            {
              header: s(() => [
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
                    default: s(
                      () =>
                        e[0] ||
                        (e[0] = [n(" 代码位置 src/views/result/fail.vue ")])
                    ),
                    _: 1,
                    __: [0]
                  }
                )
              ]),
              default: s(() => [
                o(
                  i,
                  {
                    icon: "error",
                    title: "提交失败",
                    "sub-title": "请核对并修改以下信息后，再重新提交。"
                  },
                  {
                    extra: s(() => [
                      o(
                        u,
                        { type: "primary" },
                        {
                          default: s(() => e[2] || (e[2] = [n("返回修改")])),
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
  N = v(x, [["__scopeId", "data-v-028309e8"]]);
export { N as default };
