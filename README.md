# 桂林阳朔 · 六天五晚深度游攻略

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.0.4-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.38.0-black?logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet&logoColor=white" />
</p>

<p align="center">
  <b>🗺️ 交互式行程规划 · 🎨 精美动画效果 · 📱 响应式设计</b>
</p>

---

## ✨ 项目简介

这是一款专为**五一假期桂林阳朔六天五晚深度游**设计的交互式旅游攻略应用。项目采用 React + Vite 构建，集成 Leaflet 地图实现行程可视化，配合 Framer Motion 动画库打造流畅的用户体验。

### 核心功能

| 功能模块 | 描述 |
|---------|------|
| 🗺️ **交互式地图** | 按天切换行程路线，标记景点/酒店/美食位置，路线可视化 |
| 📅 **每日行程** | 详细的时间安排，可折叠展开查看详情 |
| 🎫 **订票提醒** | 智能提醒需提前预订的项目（游船、演出、酒店等） |
| 🍜 **美食推荐** | 当地特色美食攻略，含推荐店铺和价格参考 |
| ℹ️ **实用信息** | 最佳时间、交通指南、预算参考、温馨提示 |

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

---

## 🏗️ 项目结构

```
guangxi-trip-react/
├── public/              # 静态资源
├── src/
│   ├── App.jsx         # 主应用组件（含全部行程数据）
│   ├── App.css         # 全局样式
│   └── main.jsx        # 应用入口
├── index.html          # HTML 模板
├── package.json        # 项目依赖
├── vite.config.js      # Vite 配置
└── eslint.config.js    # ESLint 配置
```

---

## 🛠️ 技术栈

### 核心框架
- **[React 19](https://react.dev/)** - 用于构建用户界面的 JavaScript 库
- **[Vite](https://vitejs.dev/)** - 下一代前端构建工具

### UI & 动画
- **[Framer Motion](https://www.framer.com/motion/)** - React 动画库，用于页面过渡和交互动画
- **[Lucide React](https://lucide.dev/)** - 精美图标库

### 地图
- **[Leaflet](https://leafletjs.com/)** - 开源交互式地图库
- **[React-Leaflet](https://react-leaflet.js.org/)** - Leaflet 的 React 组件封装

### 开发工具
- **ESLint** - 代码质量检查
- **@vitejs/plugin-react** - Vite React 插件

---

## 🎯 行程亮点

### 六天五晚行程安排

| 天数 | 主题 | 亮点 |
|-----|------|------|
| Day 1 | 飞抵桂林 · 市区深度游 | 象鼻山、日月双塔、两江四湖夜游 |
| Day 2 | 龙脊梯田 · 梯田壮美 | 平安寨、七星伴月、金坑大寨 |
| Day 3 | 漓江游船 · 阳朔初印象 | 四星游船、十里画廊、《印象·刘三姐》 |
| Day 4 | 相公山日出 · 世外桃源 | 日出云海、陶渊明笔下的桃花源 |
| Day 5 | 遇龙河竹筏 · 老寨山日落 | 人工竹筏漂流、20元人民币背景、日落 |
| Day 6 | 返程 · 带走美好回忆 | 返程安排 |

---

## 📝 订票提醒

### ⚠️ 需提前预订（五一期间）

| 项目 | 提前时间 | 预订平台 | 参考价格 |
|-----|---------|---------|---------|
| 漓江四星游船 | 7-15天 | 携程/飞猪/官方公众号 | 360-450元/人 |
| 《印象·刘三姐》 | 5-10天 | 携程/美团/官方票务 | 198-688元 |
| 桂林漓江大瀑布饭店 | 14-30天 | 携程/去哪儿/官网 | 400-600元/晚 |
| 暮云悠墅轻奢全景酒店 | 14-30天 | 携程/去哪儿/Booking | 400-700元/晚 |

---

## 🍜 美食推荐

- **桂林米粉** - 老东江米粉总店/同来馆（8-15元）
- **新郭记油茶** - 正宗恭城油茶（15-30元）
- **啤酒鱼** - 大师傅啤酒鱼/谢三姐啤酒鱼（150-200元/2人）
- **竹筒饭** - 龙脊梯田农家乐（30-50元）
- **椿记烧鹅** - 桂林名菜（80-120元/人）

---

## 💡 开发要点

### 动画效果
- 使用 Framer Motion 实现页面滚动触发动画
- 日程卡片展开/收起平滑过渡
- Hero 区域入场动画

### 地图实现
- 使用 Leaflet + OpenStreetMap 实现免费地图
- 自定义标记图标（不同颜色区分类型）
- 按天切换地图视野和路线

### 响应式设计
- 移动端优先的 CSS 设计
- 自适应布局和字体
- 触摸友好的交互

---

## 📄 许可证

MIT License

---

<p align="center">
  Made with ❤️ for 桂林阳朔之旅
</p>
