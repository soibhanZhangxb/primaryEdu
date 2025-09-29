import { list as g } from "./list-CBbntEJO.js";
import {
  d as y,
  a as x,
  b as s,
  e as o,
  w as e,
  f as n,
  h as r,
  k as _,
  l as w,
  i as C,
  U as T,
  z as B,
  A as D,
  j as a,
  t as N,
  u as V,
  F as z,
  g as d,
  _ as F
} from "./index-ifxKUhWa.js";
import "./index.vue_vue_type_script_setup_true_lang-CHJLS8XQ.js";
import "./columns-C8CqayB3.js";
import "./data-oquifUtE.js";
import "./index.vue_vue_type_script_setup_true_lang-Zi1aL1lS.js";
import "./columns-BN7Jbafn.js";
import "./index.vue_vue_type_script_setup_true_lang-DW17AWxq.js";
import "./columns-xLdB3iXE.js";
import "./index.vue_vue_type_script_setup_true_lang-zb_sF0sw.js";
import "./columns-Cg0c4Jsj.js";
import "./sortable.esm-VSgMS8pS.js";
import "./index.vue_vue_type_script_setup_true_lang-DJcHsBMm.js";
import "./columns-YPVnMJjW.js";
import "./index.vue_vue_type_script_setup_true_lang-BnXFGAQd.js";
import "./columns-BlM3Z_eI.js";
import "./index.vue_vue_type_script_setup_true_lang-fsxgKA5F.js";
import "./columns-X7Gl01q2.js";
import "./xlsx-CbIkmpw3.js";
import "./index.vue_vue_type_script_setup_true_lang-Dflsyee2.js";
import "./columns-RpaoPjkS.js";
import "./index.vue_vue_type_script_setup_true_lang-Dr7v2moa.js";
import "./columns-DbMf6Tig.js";
import "./print-B-zH8tbv.js";
import "./index.vue_vue_type_script_setup_true_lang-weyj7QtM.js";
import "./columns-LAEWLsiV.js";
import "./index.vue_vue_type_script_setup_true_lang-DHLfRxBS.js";
import "./index.vue_vue_type_script_setup_true_lang-Brv2TQst.js";
import "./columns-FgTBlKdr.js";
import "./index.vue_vue_type_script_setup_true_lang-iiMtcQ_L.js";
import "./columns-BslT3HAK.js";
const S = { class: "card-header" },
  $ = { class: "font-medium" },
  j = y({
    name: "PureTableHigh",
    __name: "high",
    setup(A) {
      const p = x(0);
      function u({ index: l }) {
        p.value = l;
      }
      return (l, t) => {
        const m = r("el-link"),
          b = r("el-alert"),
          f = r("el-tab-pane"),
          h = r("el-tabs"),
          k = r("el-card"),
          v = D("tippy");
        return (
          o(),
          s(
            k,
            { shadow: "never" },
            {
              header: e(() => [
                d("div", S, [
                  d("span", $, [
                    t[1] || (t[1] = a(" 高级用法全部采用 TSX 语法，充分发挥 ")),
                    n(
                      m,
                      {
                        href: "https://github.com/pure-admin/pure-admin-table",
                        target: "_blank",
                        style: { margin: "0 4px 5px", "font-size": "16px" }
                      },
                      {
                        default: e(
                          () => t[0] || (t[0] = [a(" @pureadmin/table ")])
                        ),
                        _: 1,
                        __: [0]
                      }
                    ),
                    t[2] ||
                      (t[2] = a(
                        " 的灵活性，维护整体表格只需操作 columns 配置即可 "
                      ))
                  ])
                ]),
                n(
                  m,
                  {
                    class: "mt-2",
                    href: "https://github.com/pure-admin/vue-pure-admin/blob/main/src/views/table/high",
                    target: "_blank"
                  },
                  {
                    default: e(
                      () =>
                        t[3] || (t[3] = [a(" 代码位置 src/views/table/high ")])
                    ),
                    _: 1,
                    __: [3]
                  }
                )
              ]),
              default: e(() => [
                n(b, {
                  title: `高级用法中所有表格都设置了 row-key ，后端需返回唯一值的字段，比如id。作用：1. 用来优化 Table
      的渲染，尤其当字段在深层结构中；2. 防止拖拽后表格组件内部混乱（拖拽必须设置）`,
                  type: "info",
                  closable: !1
                }),
                n(
                  h,
                  { onTabClick: u },
                  {
                    default: e(() => [
                      (o(!0),
                      _(
                        z,
                        null,
                        w(
                          V(g),
                          (i, c) => (
                            o(),
                            s(
                              f,
                              { key: i.key, lazy: !0 },
                              {
                                label: e(() => [
                                  B(
                                    (o(), _("span", null, [a(N(i.title), 1)])),
                                    [
                                      [
                                        v,
                                        {
                                          maxWidth: "none",
                                          content: `（第 ${c + 1} 个示例）${i.content}`
                                        }
                                      ]
                                    ]
                                  )
                                ]),
                                default: e(() => [
                                  p.value == c
                                    ? (o(), s(T(i.component), { key: 0 }))
                                    : C("", !0)
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
  dt = F(j, [["__scopeId", "data-v-9c6a6a6d"]]);
export { dt as default };
