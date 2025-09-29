import { list as y } from "./list-9zYNBXwr.js";
import {
  d as g,
  a as h,
  b as l,
  e as a,
  w as t,
  f as r,
  h as n,
  k as d,
  l as C,
  i as w,
  U as z,
  z as N,
  A as B,
  j as o,
  t as D,
  u as T,
  F as V,
  g as c,
  _ as E
} from "./index-ifxKUhWa.js";
import "./base.vue_vue_type_script_setup_true_lang-6PmB3WhD.js";
import "./data-QW7qZD4F.js";
import "./stripe.vue_vue_type_script_setup_true_lang-C13m4N10.js";
import "./border.vue_vue_type_script_setup_true_lang-BAO9ZvFw.js";
import "./status.vue_vue_type_style_index_0_lang-DDvBKZZv.js";
import "./fixHeader.vue_vue_type_script_setup_true_lang-djCfaJmQ.js";
import "./fixColumn.vue_vue_type_script_setup_true_lang-nVTtML4K.js";
import "./fluidHeight.vue_vue_type_script_setup_true_lang-CBVEAWtN.js";
import "./groupHeader.vue_vue_type_script_setup_true_lang-Bxg8nCGY.js";
import "./radio.vue_vue_type_script_setup_true_lang-Bb4nXg_1.js";
import "./multipleChoice.vue_vue_type_script_setup_true_lang-Cl7NQUrl.js";
import "./sortable.vue_vue_type_script_setup_true_lang-CJf98eKh.js";
import "./filters.vue_vue_type_script_setup_true_lang-CEzJFzQS.js";
import "./index.vue_vue_type_script_setup_true_lang-DVI0E8_x.js";
import "./columns-C45YEKBn.js";
import "./index.vue_vue_type_script_setup_true_lang-C8Tu1pHP.js";
import "./columns-CPiEDCKc.js";
import "./expand.vue_vue_type_script_setup_true_lang-BbYud592.js";
import "./tree.vue_vue_type_script_setup_true_lang-F4-I3Fl0.js";
import "./totalRow.vue_vue_type_script_setup_true_lang-DMaMnUUD.js";
import "./merge.vue_vue_type_script_setup_true_lang-DjhC0f-J.js";
import "./customIndex.vue_vue_type_script_setup_true_lang-CDWST6DV.js";
import "./layout.vue_vue_type_script_setup_true_lang-Dsv99lWU.js";
import "./nestProp.vue_vue_type_script_setup_true_lang-WYWXgMT-.js";
import "./imgPreview.vue_vue_type_script_setup_true_lang-ChBcjNep.js";
const F = { class: "card-header" },
  P = { class: "font-medium" },
  $ = g({
    name: "PureTable",
    __name: "index",
    setup(j) {
      const p = h(0);
      function u({ index: m }) {
        p.value = m;
      }
      return (m, e) => {
        const i = n("el-link"),
          b = n("el-alert"),
          f = n("el-tab-pane"),
          k = n("el-tabs"),
          v = n("el-card"),
          x = B("tippy");
        return (
          a(),
          l(
            v,
            { shadow: "never" },
            {
              header: t(() => [
                c("div", F, [
                  c("span", P, [
                    e[2] || (e[2] = o(" 二次封装 Element Plus 的 ")),
                    r(
                      i,
                      {
                        href: "https://element-plus.org/zh-CN/component/table.html",
                        target: "_blank",
                        style: { margin: "0 4px 5px", "font-size": "16px" }
                      },
                      {
                        default: t(() => e[0] || (e[0] = [o(" el-table ")])),
                        _: 1,
                        __: [0]
                      }
                    ),
                    e[3] ||
                      (e[3] = o(
                        " 完全兼容 api 并提供灵活的配置项以及完善的类型提示，不用将代码都写在 template 里了 "
                      )),
                    r(
                      i,
                      {
                        href: "https://github.com/pure-admin/pure-admin-table",
                        target: "_blank",
                        style: { margin: "0 4px 5px", "font-size": "16px" }
                      },
                      {
                        default: t(
                          () => e[1] || (e[1] = [o(" @pureadmin/table 源码 ")])
                        ),
                        _: 1,
                        __: [1]
                      }
                    )
                  ])
                ]),
                r(
                  i,
                  {
                    class: "mt-2",
                    href: "https://github.com/pure-admin/vue-pure-admin/blob/main/src/views/table/base",
                    target: "_blank"
                  },
                  {
                    default: t(
                      () =>
                        e[4] || (e[4] = [o(" 代码位置 src/views/table/base ")])
                    ),
                    _: 1,
                    __: [4]
                  }
                )
              ]),
              default: t(() => [
                r(b, {
                  title: `基础用法中大部分表格都没设置 row-key ，不过最好都设置一下，后端需返回唯一值的字段，比如id。作用：1. 用来优化 Table
      的渲染，尤其当字段在深层结构中；2. 防止某些操作导致表格组件内部混乱`,
                  type: "info",
                  closable: !1
                }),
                r(
                  k,
                  { onTabClick: u },
                  {
                    default: t(() => [
                      (a(!0),
                      d(
                        V,
                        null,
                        C(
                          T(y),
                          (s, _) => (
                            a(),
                            l(
                              f,
                              { key: s.key, lazy: !0 },
                              {
                                label: t(() => [
                                  N(
                                    (a(), d("span", null, [o(D(s.title), 1)])),
                                    [
                                      [
                                        x,
                                        {
                                          maxWidth: "none",
                                          content: `（第 ${_ + 1} 个示例）${s.content}`
                                        }
                                      ]
                                    ]
                                  )
                                ]),
                                default: t(() => [
                                  p.value == _
                                    ? (a(), l(z(s.component), { key: 0 }))
                                    : w("", !0)
                                ]),
                                _: 2
                              },
                              1024
                            )
                          )
                        ),
                        128
                      ))
                    ]),
                    _: 1
                  }
                )
              ]),
              _: 1
            }
          )
        );
      };
    }
  }),
  pe = E($, [["__scopeId", "data-v-8c8f0efb"]]);
export { pe as default };
