// 完整版菜单比较多，将 rank 抽离出来，在此方便维护

const home = 0, // 平台规定只有 home 路由的 rank 才能为 0 ，所以后端在返回 rank 的时候需要从非 0 开始
  maths = 1,
  physics = 2,
  noip = 3,
  hardware = 4,
  //chatai = 11,
  //vueflow = 12,
  //ganttastic = 13,
  //components = 14,
  //able = 15,
  //table = 16,
  //form = 17,
  //list = 18,
  //result = 19,
  //error = 20,
  //frame = 21,
  //nested = 22,
  //permission = 23,
  //system = 24,
  //monitor = 25,
  //tabs = 26,
  //about = 27,
  codemirror = 28,
  //markdown = 29,
  //editor = 30,
  board = 31,
  mind = 32,
  ppt = 33,
  flowchart = 34,
  //guide = 35,
  //menuoverflow = 36;
  formdesign = 37,
  rshouce = 38;

export {
  home,
  maths,
  physics,
  noip,
  hardware,
  //chatai,
  //vueflow,
  //ganttastic,
  //components,
  //able,
  //table,
  //form,
  //list,
  //result,
  //error,
  //frame,  //不能删
  //nested,
  //permission, //不能删
  //system, //不能删
  //monitor, //不能删
  //tabs,
  //about,
  codemirror,
  //markdown,
  //editor,
  board,
  mind,
  ppt,
  flowchart,
  //guide,
  //menuoverflow
  formdesign,
  rshouce
};
