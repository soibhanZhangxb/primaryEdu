import { hardware } from "@/router/enums";

export default {
  path: "/hardware",
  redirect: "/hardware/index",
  meta: {
    icon: "ri/ubuntu-fill",
    title: "嵌入式机器人",
    rank: hardware
  },
  children: [
    {
      path: "/hardware/jlinear",
      name: "JLinear4", //Linear Equation in One Variable
      component: () => import("@/views/hardware/jlinear.vue"),
      meta: {
        title: "一元一次方程444"
      }
    },
    {
      path: "/hardware/jquadratic",
      name: "JQuadratic4", //
      component: () => import("@/views/hardware/jquadratic.vue"),
      meta: {
        title: "一元二次方程444"
      }
    },
    {
      path: "/hardware/jinverse",
      name: "JInverse4", //Inverse Proportion
      component: () => import("@/views/hardware/jinverse.vue"),
      meta: {
        title: "反比例函数444"
      }
    },
    {
      path: "/hardware/jtrig",
      name: "JTrig4", //Trig Function
      component: () => import("@/views/hardware/jtrig.vue"),
      meta: {
        title: "三角函数444"
      }
    }
  ]
} satisfies RouteConfigsTable;
