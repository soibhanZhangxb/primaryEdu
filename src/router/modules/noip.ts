import { noip } from "@/router/enums";

export default {
  path: "/noip",
  redirect: "/noip/index",
  meta: {
    icon: "ri/ubuntu-fill",
    title: "信奥赛编程",
    rank: noip
  },
  children: [
    {
      path: "/noip/jsort",
      name: "JSort", //Linear Equation in One Variable
      component: () => import("@/views/noip/jsort.vue"),
      meta: {
        title: "排序算法"
      }
    },
    {
      path: "/noip/jsort2",
      name: "JSort2", //Linear Equation in One Variable
      component: () => import("@/views/noip/jsort2.vue"),
      meta: {
        title: "排序算法2"
      }
    },
    {
      path: "/noip/ntest",
      name: "NTest", //Trig Function
      component: () => import("@/views/noip/ntest.vue"),
      meta: {
        title: "测试CSP"
      }
    },
    {
      path: "/noip/dp/fibonacci",
      name: "DPFibonacci", //Trig Function
      component: () => import("@/views/noip/dp/fibonacci.vue"),
      meta: {
        title: "斐波那契数列"
      }
    },
    {
      path: "/noip/dp/stairs",
      name: "DPStairs", //Trig Function
      component: () => import("@/views/noip/dp/stairs.vue"),
      meta: {
        title: "爬楼梯"
      }
    },
    {
      path: "/noip/dp/lcs",
      name: "DPLcs", //Trig Function
      component: () => import("@/views/noip/dp/lcs.vue"),
      meta: {
        title: "最长子序列"
      }
    }
  ]
} satisfies RouteConfigsTable;
