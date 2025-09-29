import { b as r } from "./data-oquifUtE.js";
import { a as s, a7 as l, m as p, aR as n, S as i } from "./index-ifxKUhWa.js";
function u(a) {
  const e = s(l(r, !0)),
    t = [
      { label: "ID", prop: "id" },
      { label: "日期", prop: "date" },
      { label: "姓名", prop: "name" },
      { label: "地址", prop: "address" }
    ];
  return (
    p(() => {
      n().then(() => {
        const { setWatermark: o } = i(a.value.getTableDoms().tableWrapper);
        o("编程即艺术", {
          font: "16px Microsoft YaHei",
          globalAlpha: 0.8,
          forever: !0,
          width: 240,
          height: 90
        });
      });
    }),
    { columns: t, dataList: e }
  );
}
export { u as useColumns };
