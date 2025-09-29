import {
  d as I,
  a as y,
  h as a,
  k as F,
  e as P,
  f as t,
  w as n,
  u as e,
  j as s,
  z as w,
  $ as z,
  ab as M,
  _ as N
} from "./index-ifxKUhWa.js";
import { useMenu as j } from "./hook-ByLGAWay.js";
import { P as L } from "./index-Cl6dtH_t.js";
import { u as m } from "./hooks-DNx1M7hz.js";
import { D as O } from "./delete-DeDT0XGg.js";
import { E as U } from "./edit-pen-D184Bsbv.js";
import { R as q } from "./refresh-C_XcZq6o.js";
import { A as C } from "./add-circle-line-CJowuUrw.js";
import "./form.vue_vue_type_script_setup_true_lang-CCSnPwGG.js";
import "./index-C5Cry9GV.js";
import "./index-Drz_Z608.js";
import "./index-AjS5VvF6.js";
import "./system-CYz2Iuiu.js";
import "./sortable.esm-VSgMS8pS.js";
import "./epTheme-BQrGJ6FS.js";
import "./collapse-zsrgJ2xQ.js";
const G = { class: "main" },
  H = I({
    name: "SystemMenu",
    __name: "index",
    setup(J) {
      const u = y(),
        p = y(),
        {
          form: f,
          loading: c,
          columns: R,
          dataList: x,
          onSearch: _,
          resetForm: $,
          openDialog: d,
          handleDelete: h,
          handleSelectionChange: S
        } = j();
      function D() {
        p.value.setAdaptive();
      }
      return (K, o) => {
        var g;
        const T = a("el-input"),
          b = a("el-form-item"),
          r = a("el-button"),
          V = a("el-form"),
          A = a("el-popconfirm"),
          B = a("pure-table");
        return (
          P(),
          F("div", G, [
            t(
              V,
              {
                ref_key: "formRef",
                ref: u,
                inline: !0,
                model: e(f),
                class:
                  "search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
              },
              {
                default: n(() => [
                  t(
                    b,
                    { label: "菜单名称：", prop: "title" },
                    {
                      default: n(() => [
                        t(
                          T,
                          {
                            modelValue: e(f).title,
                            "onUpdate:modelValue":
                              o[0] || (o[0] = l => (e(f).title = l)),
                            placeholder: "请输入菜单名称",
                            clearable: "",
                            class: "w-[180px]!"
                          },
                          null,
                          8,
                          ["modelValue"]
                        )
                      ]),
                      _: 1
                    }
                  ),
                  t(b, null, {
                    default: n(() => [
                      t(
                        r,
                        {
                          type: "primary",
                          icon: e(m)("ri/search-line"),
                          loading: e(c),
                          onClick: e(_)
                        },
                        {
                          default: n(() => o[3] || (o[3] = [s(" 搜索 ")])),
                          _: 1,
                          __: [3]
                        },
                        8,
                        ["icon", "loading", "onClick"]
                      ),
                      t(
                        r,
                        {
                          icon: e(m)(e(q)),
                          onClick: o[1] || (o[1] = l => e($)(u.value))
                        },
                        {
                          default: n(() => o[4] || (o[4] = [s(" 重置 ")])),
                          _: 1,
                          __: [4]
                        },
                        8,
                        ["icon"]
                      )
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              },
              8,
              ["model"]
            ),
            t(
              e(L),
              {
                title: "菜单管理（仅演示，操作后不生效）",
                columns: e(R),
                isExpandAll: !1,
                tableRef: (g = p.value) == null ? void 0 : g.getTableRef(),
                onRefresh: e(_),
                onFullscreen: D
              },
              {
                buttons: n(() => [
                  t(
                    r,
                    {
                      type: "primary",
                      icon: e(m)(e(C)),
                      onClick: o[2] || (o[2] = l => e(d)())
                    },
                    {
                      default: n(() => o[5] || (o[5] = [s(" 新增菜单 ")])),
                      _: 1,
                      __: [5]
                    },
                    8,
                    ["icon"]
                  )
                ]),
                default: n(({ size: l, dynamicColumns: E }) => [
                  t(
                    B,
                    {
                      ref_key: "tableRef",
                      ref: p,
                      adaptive: "",
                      adaptiveConfig: { offsetBottom: 45 },
                      "align-whole": "center",
                      "row-key": "id",
                      showOverflowTooltip: "",
                      "table-layout": "auto",
                      loading: e(c),
                      size: l,
                      data: e(x),
                      columns: E,
                      "header-cell-style": {
                        background: "var(--el-fill-color-light)",
                        color: "var(--el-text-color-primary)"
                      },
                      onSelectionChange: e(S)
                    },
                    {
                      operation: n(({ row: i }) => {
                        var v;
                        return [
                          t(
                            r,
                            {
                              class: "reset-margin",
                              link: "",
                              type: "primary",
                              size: l,
                              icon: e(m)(e(U)),
                              onClick: k => e(d)("修改", i)
                            },
                            {
                              default: n(() => o[6] || (o[6] = [s(" 修改 ")])),
                              _: 2,
                              __: [6]
                            },
                            1032,
                            ["size", "icon", "onClick"]
                          ),
                          w(
                            t(
                              r,
                              {
                                class: "reset-margin",
                                link: "",
                                type: "primary",
                                size: l,
                                icon: e(m)(e(C)),
                                onClick: k => e(d)("新增", { parentId: i.id })
                              },
                              {
                                default: n(
                                  () => o[7] || (o[7] = [s(" 新增 ")])
                                ),
                                _: 2,
                                __: [7]
                              },
                              1032,
                              ["size", "icon", "onClick"]
                            ),
                            [[z, i.menuType !== 3]]
                          ),
                          t(
                            A,
                            {
                              title: `是否确认删除菜单名称为${e(M)(i.title)}的这条数据${((v = i == null ? void 0 : i.children) == null ? void 0 : v.length) > 0 ? "。注意下级菜单也会一并删除，请谨慎操作" : ""}`,
                              onConfirm: k => e(h)(i)
                            },
                            {
                              reference: n(() => [
                                t(
                                  r,
                                  {
                                    class: "reset-margin",
                                    link: "",
                                    type: "primary",
                                    size: l,
                                    icon: e(m)(e(O))
                                  },
                                  {
                                    default: n(
                                      () => o[8] || (o[8] = [s(" 删除 ")])
                                    ),
                                    _: 2,
                                    __: [8]
                                  },
                                  1032,
                                  ["size", "icon"]
                                )
                              ]),
                              _: 2
                            },
                            1032,
                            ["title", "onConfirm"]
                          )
                        ];
                      }),
                      _: 2
                    },
                    1032,
                    ["loading", "size", "data", "columns", "onSelectionChange"]
                  )
                ]),
                _: 1
              },
              8,
              ["columns", "tableRef", "onRefresh"]
            )
          ])
        );
      };
    }
  }),
  fe = N(H, [["__scopeId", "data-v-b60ab45c"]]);
export { fe as default };
