import { physics } from "@/router/enums";

export default {
  path: "/physics",
  redirect: "/physics/index",
  meta: {
    icon: "ri/ubuntu-fill",
    title: "初中物理",
    rank: physics
  },
  children: [
    {
      path: "/physics/jpulley",
      name: "JPulley", //@/views/physics/jpulley.vue
      component: () => import("@/views/physics/jpulley.vue"),
      meta: {
        title: "滑轮组"
      }
    },
    {
      path: "/physics/convexLens",
      name: "ConvexLens", //
      component: () => import("@/views/physics/convexLens.vue"),
      meta: {
        title: "凸透镜成像"
      }
    },
    {
      path: "/physics/ptest2",
      name: "PTest2", //
      component: () => import("@/views/physics/ptest2.vue"),
      meta: {
        title: "物理测试2"
      }
    }
  ]
} satisfies RouteConfigsTable;
