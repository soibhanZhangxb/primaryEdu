import { maths } from "@/router/enums";

export default {
  path: "/maths",
  redirect: "/maths/jlinear",
  meta: {
    icon: "ri/ubuntu-fill",
    title: "初中数学",
    rank: maths
  },
  children: [
    {
      path: "/maths/stickmen",
      name: "StickMen", //Trig Function
      component: () => import("@/views/maths/stickmen.vue"),
      meta: {
        title: "火柴人"
      }
    },
    {
      path: "/maths/jlinear",
      name: "JLinear", //Linear Equation in One Variable
      component: () => import("@/views/maths/jlinear.vue"),
      meta: {
        title: "一次函数"
      }
    },
    {
      path: "/maths/jquadratic",
      name: "JQuadratic", //
      component: () => import("@/views/maths/jquadratic.vue"),
      meta: {
        title: "二次函数"
      }
    },
    {
      path: "/maths/jinverse",
      name: "JInverse", //Inverse Proportion
      component: () => import("@/views/maths/jinverse.vue"),
      meta: {
        title: "反比例函数"
      }
    },
    {
      path: "/maths/jtrig",
      name: "JTrig", //Trig Function
      component: () => import("@/views/maths/jtrig.vue"),
      meta: {
        title: "三角函数"
      }
    },
    {
      path: "/maths/jcircle",
      name: "JCircle", //Trig Function
      component: () => import("@/views/maths/jcircle.vue"),
      meta: {
        title: "初中圆"
      }
    },
    {
      path: "/maths/acombination", // Arrangement 和组合 Combination
      name: "ACombination", //Trig Function
      component: () => import("@/views/maths/acombination.vue"),
      meta: {
        title: "排列组合"
      }
    },
    {
      path: "/maths/acombination2", // Arrangement 和组合 Combination
      name: "ACombination2", //Trig Function
      component: () => import("@/views/maths/acombination2.vue"),
      meta: {
        title: "排列组合2"
      }
    },
    {
      path: "/maths/jtest",
      name: "JTest", //Trig Function
      component: () => import("@/views/maths/jtest.vue"),
      meta: {
        title: "测试"
      }
    },
    {
      path: "/maths/jtest2",
      name: "JTest2", //Trig Function
      component: () => import("@/views/maths/jtest2.vue"),
      meta: {
        title: "测试math"
      }
    },
    {
      path: "/maths/tmp",
      name: "JTmp", //Trig Function
      component: () => import("@/views/maths/jtmp.vue"),
      meta: {
        title: "左右模板"
      }
    }
  ]
} satisfies RouteConfigsTable;
