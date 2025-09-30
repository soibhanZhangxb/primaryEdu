import { $t } from "@/plugins/i18n";

export interface ListItem {
  avatar: string;
  title: string;
  datetime: string;
  type: string;
  description: string;
  status?: "primary" | "success" | "warning" | "info" | "danger";
  extra?: string;
}

export interface TabItem {
  key: string;
  name: string;
  list: ListItem[];
  emptyText: string;
}

export const noticesData: TabItem[] = [
  {
    key: "1",
    name: $t("status.pureNotify"),
    list: [{
      avatar: "https://xiaoxian521.github.io/hyperlink/svg/smile1.svg",
      title:"测地线",
      description: "在广义相对论中，测地线是大质量物体在时空中的自然路径。寓意您的网站是探索知识最直接、最优雅的路径",
      datetime: "今天",
      type: "1"
    }],
    emptyText: $t("status.pureNoNotify")
  },
  {
    key: "2",
    name: $t("status.pureMessage"),
    list: [
      {
        avatar: "https://xiaoxian521.github.io/hyperlink/svg/smile1.svg",
        title: "太棒了",
        description: "讲抽象的数学物理概念可视化，并融入费曼学习法，能极大地提升学习深度和乐趣！",
        datetime: "今天",
        type: "2"
      },
      {
        avatar: "https://xiaoxian521.github.io/hyperlink/svg/smile2.svg",
        title: "概念构筑",
        description: "学习不是被动接收，而是像工匠一样主动“构筑”自己的知识体系;知识是一个相互连接的网络，这个软件能帮助你编织属于自己的知识网络",
        datetime: "昨天",
        type: "2"
      },
      {
        avatar: "https://xiaoxian521.github.io/hyperlink/svg/smile5.svg",
        title: "费曼学习法",
        description:
          "费曼学习法目的是深度思考🤔， 教是最好的学！",
        datetime: "时间",
        type: "2"
      }
    ],
    emptyText: $t("status.pureNoMessage")
  },
  {
    key: "3",
    name: $t("status.pureTodo"),
    list: [
      {
        avatar: "",
        title: "第三方紧急代码变更",
        description:
          "小林提交于 2024-05-10，需在 2024-05-11 前完成代码变更任务",
        datetime: "",
        extra: "马上到期",
        status: "danger",
        type: "3"
      },
      {
        avatar: "",
        title: "版本发布",
        description: "指派小明于 2024-06-18 前完成更新并发布",
        datetime: "",
        extra: "已耗时 8 天",
        status: "warning",
        type: "3"
      },
      {
        avatar: "",
        title: "新功能开发",
        description: "开发多租户管理",
        datetime: "",
        extra: "进行中",
        type: "3"
      },
      {
        avatar: "",
        title: "任务名称",
        description: "任务需要在 2030-10-30 10:00 前启动",
        datetime: "",
        extra: "未开始",
        status: "info",
        type: "3"
      }
    ],
    emptyText: $t("status.pureNoTodo")
  }
];
