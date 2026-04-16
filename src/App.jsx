import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Calendar, Clock, Camera, Utensils, Mountain, Sun,
  Moon, Navigation, ChevronDown, Star, Info, ArrowRight,
  Compass, Waves, Hotel, Train, Plane, Map as MapIcon, X,
  Ticket, AlertCircle, CreditCard, User, FileText, MapPinned,
  Sunrise, Sunset, Bike, Coffee, ShoppingBag, Tent
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

// 创建自定义标记图标
const createCustomIcon = (type) => {
  const colors = {
    start: '#22c55e',      // 绿色 - 起点
    end: '#ef4444',        // 红色 - 终点
    hotel: '#8b5cf6',      // 紫色 - 酒店
    food: '#f59e0b',       // 橙色 - 美食
    attraction: '#06b6d4', // 青色 - 景点
    optional: '#94a3b8',   // 灰色 - 备选
    transport: '#3b82f6',  // 蓝色 - 交通
    sunset: '#f97316',     // 橙色 - 日落点
    sunrise: '#f59e0b'     // 黄色 - 日出点
  }
  
  const color = colors[type] || '#06b6d4'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

// 订票信息配置
const bookingInfo = {
  urgent: [
    {
      name: "漓江四星游船",
      bookInAdvance: "7-15天",
      urgency: "high",
      platform: "携程/飞猪/官方公众号",
      needItems: ["身份证号", "手机号", "选择舱位（上舱视野佳）"],
      tips: "五一期间务必提前预订，建议选择含接送的套餐",
      price: "360-450元/人"
    },
    {
      name: "《印象·刘三姐》",
      bookInAdvance: "5-10天",
      urgency: "high",
      platform: "携程/美团/官方票务",
      needItems: ["身份证号", "手机号", "选择座位区域"],
      tips: "普通B区性价比高，新贵宾席位置最佳",
      price: "198-688元"
    },
    {
      name: "桂林漓江大瀑布饭店",
      bookInAdvance: "14-30天",
      urgency: "high",
      platform: "携程/去哪儿/酒店官网",
      needItems: ["身份证号", "入住日期", "房型选择"],
      tips: "五一期间房源紧张，建议选择可免费取消的房型",
      price: "400-600元/晚"
    },
    {
      name: "暮云悠墅轻奢全景酒店",
      bookInAdvance: "14-30天",
      urgency: "high",
      platform: "携程/去哪儿/Booking",
      needItems: ["身份证号", "入住日期", "房型偏好"],
      tips: "阳朔五一住宿非常紧张，越早订越好",
      price: "400-700元/晚"
    }
  ],
  recommended: [
    {
      name: "龙脊梯田门票",
      bookInAdvance: "1-3天",
      urgency: "medium",
      platform: "大众点评/携程/现场购买",
      needItems: ["身份证号"],
      tips: "门票80元，现场购买即可，但五一可能排队",
      price: "80元"
    },
    {
      name: "遇龙河竹筏",
      bookInAdvance: "1-3天",
      urgency: "medium",
      platform: "携程/飞猪/现场购票",
      needItems: ["身份证号"],
      tips: "金龙桥-旧县段最经典，建议早8点去排队少",
      price: "160元/筏（2人）"
    },
    {
      name: "相公山",
      bookInAdvance: "无需提前",
      urgency: "low",
      platform: "现场购票",
      needItems: ["无需证件"],
      tips: "60元/人，日出时段人多建议早到",
      price: "60元"
    },
    {
      name: "象鼻山",
      bookInAdvance: "1天",
      urgency: "low",
      platform: "美团/携程/官方小程序",
      needItems: ["身份证号"],
      tips: "75元/人，建议提前一天购买",
      price: "75元"
    }
  ]
}

// 每日订票提醒
const dayBookingReminders = {
  1: [
    { name: "漓江大瀑布饭店", type: "must", desc: "必须提前14-30天预订" },
    { name: "两江四湖夜游", type: "recommended", desc: "建议提前1-3天预订" }
  ],
  2: [
    { name: "龙脊梯田门票", type: "recommended", desc: "建议提前1-3天预订" }
  ],
  3: [
    { name: "漓江四星游船", type: "must", desc: "必须提前7-15天预订" },
    { name: "暮云悠墅轻奢全景酒店", type: "must", desc: "必须提前14-30天预订" },
    { name: "《印象·刘三姑》", type: "must", desc: "必须提前5-10天预订" }
  ],
  4: [
    { name: "相公山日出", type: "optional", desc: "日出视天气而定，阴雨天可取消" },
    { name: "世外桃源", type: "recommended", desc: "建议提前1-3天预订" }
  ],
  5: [
    { name: "遇龙河竹笏", type: "recommended", desc: "建议提前1-3天预订" },
    { name: "老寨山日落", type: "optional", desc: "日落视天气而定，在兴坪古镇" }
  ],
  6: [
    { name: "阳朔→机场大巴", type: "must", desc: "建议提前1天预订或咨询酒店前台" }
  ]
}

// 景点数据 - 六天五晚桂林阳朔行程
const attractions = [
  { id: 1, name: "龙脊梯田·平安寨", category: "scenic", day: 2, lat: 25.7260, lng: 110.0720, type: "世界遗产", description: "开发最成熟的梯田景区，七星伴月观景台，石板路相对好走", price: "80元", bestTime: "上午", tips: "第二天全天游览，感受梯田壮美" },
  { id: 2, name: "龙脊梯田·金坑大寨", category: "scenic", day: 2, lat: 25.7460, lng: 110.1020, type: "摄影圣地", description: "最壮观的梯田，千层天梯、西山韶乐，五一灌水期镜面梯田", price: "80元（已含平安寨）", bestTime: "下午", tips: "时间充裕可去金坑，视野更开阔" },
  { id: 3, name: "两江四湖", category: "scenic", day: 1, lat: 25.2815, lng: 110.2920, type: "环城水系", description: "桂林环城水系，杉湖、榕湖、桂湖、木龙湖与漓江、桃花江相连", price: "免费（游船180元）", bestTime: "夜晚", tips: "第一天晚上游船欣赏瓷磁夜景" },
  { id: 4, name: "新郭记油茶", category: "food", day: 2, lat: 25.2820, lng: 110.2910, type: "特色早餐", description: "桂林地道油茶店，正宗恭城油茶配糕点", price: "15-30元", bestTime: "早餐", tips: "油茶是桂林特色早餐，配糯米巴巴、艾叶粑" },
  { id: 5, name: "日月双塔文化公园", category: "scenic", day: 1, lat: 25.2780, lng: 110.2900, type: "文化公园", description: "杉湖中的日月双塔，日塔为铜塔，月塔为琉璃塔，桂林新地标", price: "公园免费（登塔35元）", bestTime: "傍晚", tips: "登塔可俯瞰桂林市区，公园免费" },
  { id: 6, name: "象鼻山", category: "scenic", day: 1, lat: 25.2740, lng: 110.2930, type: "地标景点", description: "桂林城徽，山形酷似大象饮水漓江，必打卡景点", price: "75元", bestTime: "下午3-6点", tips: "第一天下午游览，最佳拍摄点在漓江对岸" },
  { id: 7, name: "东西巷", category: "culture", day: 1, lat: 25.2830, lng: 110.2960, type: "古街/美食", description: "桂林历史文化街区，明清古建筑，集美食购物于一体", price: "免费", bestTime: "傍晚至晚上", tips: "品尝地道桂林小吃，感受古城韵味" },
  { id: 8, name: "正阳路步行街", category: "culture", day: 1, lat: 25.2800, lng: 110.2930, type: "商业街", description: "桂林最繁华的商业街，美食购物聚集地", price: "免费", bestTime: "晚上", tips: "晚餐和夜宵的好去处" },
  { id: 9, name: "漓江四星游船", category: "scenic", day: 3, lat: 25.2850, lng: 110.3000, type: "游船观光", description: "磨盘山/竹江码头至阳朔龙头山码头，全程约4小时", price: "360-450元/人", bestTime: "上午9-10点", tips: "五一期间提前预订，上舱视野更好" },
  { id: 10, name: "十里画廊", category: "scenic", day: 3, lat: 24.7580, lng: 110.4850, type: "骑行/风光", description: "阳朔最美骑行路线，沿途喀斯特峰丛如诗如画", price: "免费（租车约20-50元）", bestTime: "下午3-6点", tips: "租电动车悠闲骑行" },
  { id: 11, name: "月亮山", category: "scenic", day: 3, lat: 24.7450, lng: 110.4950, type: "登山/奇观", description: "山顶天然石拱如月，远近观之圆缺变化", price: "35元", bestTime: "傍晚", tips: "在十里画廊沿途，可远观或攀登" },
  { id: 12, name: "《印象·刘三姐》", category: "culture", day: 3, lat: 24.7780, lng: 110.5050, type: "实景演出", description: "张艺谋导演大型山水实景演出，漓江为舞台的视听盛宴", price: "198-688元", bestTime: "晚上8点", tips: "普通票性价比最高，提前订票选中间位置" },
  { id: 13, name: "相公山", category: "scenic", day: 4, lat: 24.9500, lng: 110.5200, type: "摄影/日出", description: "俯瞰漓江第一湾，千里江山图尽收眼底，摄影圣地", price: "60元", bestTime: "日出前1小时", tips: "日出视天气而定，需要早起" },
  { id: 14, name: "阳朔西街", category: "culture", day: 4, lat: 24.7780, lng: 110.4960, type: "古街/购物", description: "1400年历史老街，中西文化交融，美食与购物天堂", price: "免费", bestTime: "下午至夜晚", tips: "主街消费偏高，推荐去附近巷子里的小馆子" },
  { id: 15, name: "遇龙河竹筏", category: "scenic", day: 5, lat: 24.7500, lng: 110.4800, type: "竹筏/漂流", description: "小漓江，人工竹筏漂流，金龙桥至旧县段最经典", price: "160元/筏（2人）", bestTime: "上午8-10点", tips: "推荐金龙桥→旧县段，约90分钟" },
  { id: 16, name: "兴坪古镇", category: "culture", day: 5, lat: 24.9180, lng: 110.5450, type: "古镇/摄影", description: "20元人民币背景取景地，千年古镇", price: "免费", bestTime: "下午光线好", tips: "漓江边黄布倒影是20元人民币背景" },
  { id: 17, name: "老寨山", category: "scenic", day: 5, lat: 24.9180, lng: 110.5500, type: "登山/日落", description: "俯瞰兴坪漓江大拐弯，千里江山图日落绝佳位置", price: "免费", bestTime: "日落前1小时", tips: "徒步路线较险，建议穿运动鞋，日落绝美" },
  { id: 18, name: "银子岩", category: "scenic", day: 4, lat: 24.7120, lng: 110.4550, type: "溶洞/奇观", description: "阳朔最美溶洞，钟乳石洁白如银，游程约2公里", price: "65元", bestTime: "上午或下午", tips: "洞内恒温18度，带件薄外套" },
  { id: 19, name: "大榕树", category: "scenic", day: 4, lat: 24.7550, lng: 110.4900, type: "古树/爱情", description: "1400年古榕树，《刘三姐》电影取景地", price: "20元", bestTime: "下午", tips: "十里画廊沿线，可顺路游览" },
  { id: 20, name: "蝴蝶泉", category: "scenic", day: 3, lat: 24.7680, lng: 110.4800, type: "溶洞/奇观", description: "喀斯特溶洞与蝴蝶标本馆，洞口形似蝴蝶", price: "55元", bestTime: "上午", tips: "十里画廊入口附近" },
  { id: 21, name: "世外桃源", category: "scenic", day: 4, lat: 24.8320, lng: 110.4450, type: "湖光/文化", description: "陶渊明笔下的桃花源，乘小船穿越溶洞，体验侗族壮族风情", price: "60元", bestTime: "下午", tips: "小船游览约30分钟，有侗族风雨桥和壮族鼓楼" },
]

// 地图标记数据 - 按天组织
const mapMarkersByDay = {
  1: [
    { name: "桂林两江机场", lat: 25.2180, lng: 110.0400, type: "start" },
    { name: "桂林漓江大瀑布饭店", lat: 25.2695, lng: 110.2880, type: "hotel" },
    { name: "象鼻山", lat: 25.2740, lng: 110.2930, type: "attraction" },
    { name: "日月双塔", lat: 25.2780, lng: 110.2900, type: "attraction" },
    { name: "两江四湖", lat: 25.2815, lng: 110.2920, type: "attraction" },
    { name: "东西巷", lat: 25.2830, lng: 110.2960, type: "attraction" },
    { name: "正阳路步行街", lat: 25.2800, lng: 110.2930, type: "attraction" },
  ],
  2: [
    { name: "桂林漓江大瀑布饭店", lat: 25.2695, lng: 110.2880, type: "hotel" },
    { name: "新郭记油茶", lat: 25.2820, lng: 110.2910, type: "food" },
    { name: "龙脊梯田·平安寨", lat: 25.7260, lng: 110.0720, type: "attraction" },
    { name: "龙脊梯田·金坑大寨", lat: 25.7460, lng: 110.1020, type: "attraction" },
  ],
  3: [
    { name: "桂林漓江大瀑布饭店", lat: 25.2695, lng: 110.2880, type: "hotel" },
    { name: "磨盘山码头", lat: 25.3000, lng: 110.3200, type: "start" },
    { name: "阳朔龙头山码头", lat: 24.7780, lng: 110.4960, type: "attraction" },
    { name: "十里画廊", lat: 24.7580, lng: 110.4850, type: "attraction" },
    { name: "月亮山", lat: 24.7450, lng: 110.4950, type: "attraction" },
    { name: "《印象·刘三姐》", lat: 24.7780, lng: 110.5050, type: "attraction" },
    { name: "暮云悠墅酒店", lat: 24.7760, lng: 110.4980, type: "hotel" },
  ],
  4: [
    { name: "暮云悠墅酒店", lat: 24.7760, lng: 110.4980, type: "hotel" },
    { name: "相公山", lat: 24.9500, lng: 110.5200, type: "sunrise" },
    { name: "世外桃源", lat: 24.8320, lng: 110.4450, type: "attraction" },
    { name: "阳朔西街", lat: 24.7780, lng: 110.4960, type: "attraction" },
  ],
  5: [
    { name: "暮云悠墅酒店", lat: 24.7760, lng: 110.4980, type: "hotel" },
    { name: "金龙桥码头", lat: 24.7550, lng: 110.4650, type: "start" },
    { name: "遇龙河竹筏终点", lat: 24.7450, lng: 110.4850, type: "attraction" },
    { name: "兴坪古镇", lat: 24.9180, lng: 110.5450, type: "attraction" },
    { name: "老寨山", lat: 24.9180, lng: 110.5500, type: "sunset" },
  ],
  6: [
    { name: "暮云悠墅酒店", lat: 24.7760, lng: 110.4980, type: "hotel" },
    { name: "阳朔汽车总站", lat: 24.7780, lng: 110.5050, type: "start" },
    { name: "桂林两江机场", lat: 25.2180, lng: 110.0400, type: "end" },
  ]
}

// 地图视野配置
const mapViewConfig = {
  1: { center: [25.279, 110.293], zoom: 13 },
  2: { center: [25.500, 110.180], zoom: 10 },
  3: { center: [25.031, 110.398], zoom: 10 },
  4: { center: [24.850, 110.480], zoom: 11 },
  5: { center: [24.834, 110.513], zoom: 11 },
  6: { center: [24.997, 110.269], zoom: 10 }
}

// 路线数据
const routeLines = {
  1: [[25.2180, 110.0400], [25.2695, 110.2880], [25.2740, 110.2930], [25.2780, 110.2900],
       [25.2815, 110.2920], [25.2830, 110.2960], [25.2800, 110.2930], [25.2695, 110.2880]],
  2: [[25.2695, 110.2880], [25.7260, 110.0720], [25.7460, 110.1020]],
  3: [[25.2695, 110.2880], [25.3000, 110.3200], [24.7780, 110.4960],
       [24.7580, 110.4850], [24.7450, 110.4950], [24.7780, 110.5050]],
  4: [[24.7760, 110.4980], [24.9500, 110.5200], [24.7760, 110.4980], 
       [24.8320, 110.4450], [24.7780, 110.4960]],
  5: [[24.7760, 110.4980], [24.7550, 110.4650], [24.7450, 110.4850], 
       [24.9180, 110.5450], [24.9180, 110.5500]],
  6: [[24.7760, 110.4980], [24.7780, 110.5050], [25.2180, 110.0400]]
}

// 每日行程数据 - 六天五晚（优化版）
const itinerary = [
  {
    day: 1,
    title: "飞抵桂林 · 市区深度游",
    theme: "云端抵达 → 桂林市区精华",
    color: "#06b6d4",
    highlights: ["两江机场", "漓江大瀑布饭店", "象鼻山", "两江四湖"],
    schedule: [
      { time: "13:50", activity: "飞机抵达桂林两江机场，取行李出关", icon: "plane" },
      { time: "14:30", activity: "乘坐机场大巴/打车前往桂林漓江大瀑布饭店（约50分钟）", icon: "car" },
      { time: "15:30", activity: "抵达漓江大瀑布饭店，办理入住手续，稍作休息", icon: "hotel" },
      { time: "16:30", activity: "步行前往象鼻山景区（约15分钟）", icon: "walk" },
      { time: "17:00", activity: "游览象鼻山——桂林城徽，拍摄经典打卡照", icon: "scenic" },
      { time: "18:00", activity: "步行前往日月双塔文化公园，登塔俯瞰桂林", icon: "scenic" },
      { time: "19:00", activity: "东西巷品尝地道桂林小吃，感受古城韵味", icon: "food" },
      { time: "20:00", activity: "正阳路步行街散步，体验桂林夜生活", icon: "culture" },
      { time: "21:00", activity: "两江四湖夜游船——乘船浏览璀璨夜景", icon: "night" },
      { time: "22:30", activity: "返回酒店休息", icon: "hotel" }
    ],
    hotel: {
      name: "桂林漓江大瀑布饭店",
      stars: 4,
      price: "400-600元/晚",
      description: "市中心地标酒店，楼顶人工瀑布壮观，步行可达象鼻山和两江四湖",
      features: ["楼顶人工瀑布", "市中心位置", "近象鼻山", "豪华设施"]
    }
  },
  {
    day: 2,
    title: "龙脊梯田 · 梯田壮美",
    theme: "梯田之美 · 遥望千里江山",
    color: "#8b5cf6",
    highlights: ["龙脊梯田", "平安寨", "七星伴月", "金坑大寨"],
    schedule: [
      { time: "07:00", activity: "起床，酒店早餐", icon: "food" },
      { time: "08:00", activity: "乘坐拼车/包车前往龙脊梯田（约2小时车程）", icon: "car" },
      { time: "10:00", activity: "抵达龙脊梯田景区，购票入园", icon: "ticket" },
      { time: "10:30", activity: "前往平安寨，步行至七星伴月观景台", icon: "scenic" },
      { time: "12:00", activity: "龙脊梯田农家乐午餐——竹筒饭、腌肉、野菜", icon: "food" },
      { time: "13:30", activity: "继续游览平安寨，五一灌水期镜面梯田极美", icon: "scenic" },
      { time: "15:00", activity: "前往金坑大寨，千层天梯观景台俯瞰壮美梯田", icon: "camera" },
      { time: "16:30", activity: "西山韶乐观景台，拍摄千里江山图", icon: "camera" },
      { time: "17:30", activity: "返回桂林市区（约2小时车程）", icon: "car" },
      { time: "19:30", activity: "正阳步行街晚餐，品尝桂林特色菜", icon: "food" },
      { time: "21:00", activity: "返回酒店休息", icon: "hotel" }
    ],
    hotel: {
      name: "桂林漓江大瀑布饭店",
      stars: 4,
      price: "400-600元/晚",
      description: "第二晚继续入住市中心",
      features: ["楼顶人工瀑布", "市中心位置", "近象鼻山", "豪华设施"]
    }
  },
  {
    day: 3,
    title: "漓江游船 · 阳朔初印象",
    theme: "百里画廊 · 山水甲天下",
    color: "#f59e0b",
    highlights: ["四星游船", "十里画廊", "月亮山", "印象刘三姐"],
    schedule: [
      { time: "07:00", activity: "酒店早餐，早起准备", icon: "food" },
      { time: "08:00", activity: "前往磨盘山码头（约40分钟车程）", icon: "car" },
      { time: "09:00", activity: "登上四星游船，开始漓江精华游（约4小时）", icon: "scenic" },
      { time: "12:00", activity: "船上享用自助午餐，欣赏九马画山、黄布倒影", icon: "food" },
      { time: "13:00", activity: "抵达阳朔龙头山码头，前往酒店办理入住", icon: "hotel" },
      { time: "14:30", activity: "酒店休息调整后，租电动车前往十里画廊", icon: "activity" },
      { time: "15:00", activity: "十里画廊骑行——途经蝴蝶泉、大榕树、月亮山", icon: "scenic" },
      { time: "17:30", activity: "月亮山登山观景或远观拍照", icon: "scenic" },
      { time: "18:30", activity: "晚餐——椿记烧鹅阳朔店或啤酒鱼", icon: "food" },
      { time: "20:00", activity: "观看《印象·刘三姐》实景演出", icon: "culture" },
      { time: "21:30", activity: "阳朔西街漫步，感受1400年历史老街夜色", icon: "night" }
    ],
    hotel: {
      name: "暮云悠墅轻奢全景酒店（阳朔西街店）",
      stars: 4,
      price: "400-700元/晚",
      description: "阳朔西街附近轻奢酒店，全景落地窗",
      features: ["全景落地窗", "轻奢设计", "近西街", "山水景观"]
    }
  },
  {
    day: 4,
    title: "相公山日出 · 世外桃源",
    theme: "日出云海 · 陶渊明笔下的桃花源",
    color: "#22c55e",
    highlights: ["相公山日出", "世外桃源", "阳朔西街", "漓江风光"],
    schedule: [
      { time: "05:00", activity: "早起前往相公山（约40分钟车程），需带手电筒", icon: "sunrise" },
      { time: "05:30", activity: "登山至观景台占好位置", icon: "walk" },
      { time: "06:00", activity: "相公山日出——俯瞰漓江第一湾，云海与晨光交织", icon: "camera" },
      { time: "07:30", activity: "下山返回酒店补眠", icon: "hotel" },
      { time: "10:00", activity: "酒店早餐，收拾行装", icon: "food" },
      { time: "11:30", activity: "前往世外桃源景区（约20分钟车程）", icon: "car" },
      { time: "12:00", activity: "游览世外桃源——乘小船穿越溶洞，感受陶渊明笔下桃花源", icon: "scenic" },
      { time: "14:00", activity: "景区内午餐，品尝农家菜", icon: "food" },
      { time: "15:30", activity: "漫步侗族风雨桥、壮族鼓楼，体验少数民族风情", icon: "culture" },
      { time: "17:00", activity: "返回阳朔，工农桥附近欣赏遇龙河风光", icon: "camera" },
      { time: "18:00", activity: "阳朔西街晚餐，品尝啤酒鱼", icon: "food" },
      { time: "20:00", activity: "西街购物，购买特产伴手礼", icon: "shopping" },
      { time: "21:30", activity: "返回酒店休息", icon: "hotel" }
    ],
    hotel: {
      name: "暮云悠墅轻奢全景酒店（阳朔西街店）",
      stars: 4,
      price: "400-700元/晚",
      description: "第二晚继续入住，相公山日出需早起，阴雨天可调整行程",
      features: ["全景落地窗", "轻奢设计", "近西街", "山水景观"]
    }
  },
  {
    day: 5,
    title: "遇龙河竹筏 · 老寨山日落",
    theme: "小漓江 · 千里江山图日落",
    color: "#0ea5e9",
    highlights: ["遇龙河竹筏", "兴坪古镇", "20元背景", "老寨山日落"],
    schedule: [
      { time: "07:30", activity: "酒店早餐", icon: "food" },
      { time: "08:30", activity: "前往金龙桥码头，体验遇龙河竹筏漂流", icon: "activity" },
      { time: "09:00", activity: "遇龙河竹筏漂流——金龙桥至旧县段，约90分钟", icon: "scenic" },
      { time: "11:00", activity: "旧县村农家乐午餐，休息片刻", icon: "food" },
      { time: "13:00", activity: "前往兴坪古镇（约30分钟车程）", icon: "car" },
      { time: "13:30", activity: "兴坪古镇游览，20元人民币背景打卡", icon: "culture" },
      { time: "15:00", activity: "兴坪古镇闲逛，品尝当地小吃", icon: "food" },
      { time: "16:30", activity: "开始攀登老寨山（约40分钟）", icon: "walk" },
      { time: "17:30", activity: "老寨山顶等待日落——俯瞰兴坪漓江大拐弯，千里江山图", icon: "sunset" },
      { time: "19:00", activity: "下山返回阳朔", icon: "car" },
      { time: "20:00", activity: "西街晚餐，补充体力", icon: "food" }
    ],
    hotel: {
      name: "暮云悠墅轻奢全景酒店（阳朔西街店）",
      stars: 4,
      price: "400-700元/晚",
      description: "第三晚继续入住，老寨山日落视天气而定，徒步需谨慎",
      features: ["全景落地窗", "轻奢设计", "近西街", "山水景观"]
    }
  },
  {
    day: 6,
    title: "返程 · 带走美好回忆",
    theme: "告别阳朔 · 期待再会",
    color: "#ec4899",
    highlights: ["早起", "大巴赴机场", "返程"],
    schedule: [
      { time: "06:30", activity: "起床，收拾行李，酒店早餐（或外带）", icon: "hotel" },
      { time: "07:30", activity: "前往阳朔汽车总站乘坐大巴前往机场（约1.5小时）", icon: "car" },
      { time: "09:00", activity: "抵达桂林两江机场，办理登机手续", icon: "plane" },
      { time: "10:00", activity: "机场安检、候机", icon: "clock" },
      { time: "10:45", activity: "飞机起飞返回北京，结束愉快旅程", icon: "plane" }
    ],
    hotel: {
      name: "返程日",
      stars: 0,
      price: "——",
      description: "带着满满的美好回忆返回北京，期待下次再会",
      features: ["一路平安", "期待再会"]
    }
  }
]

// 美食推荐
const foodRecommendations = [
  { name: "桂林米粉", location: "老东江米粉总店/同来馆", price: "8-15元", tags: ["必吃", "早餐"], description: "卤水香浓，配菜丰富，当地人最爱的早餐" },
  { name: "新郭记油茶", location: "桂林市区多家分店", price: "15-30元", tags: ["特色早餐", "传统"], description: "正宗恭城油茶，配糯米粑粑、艾叶粑，桂林特色" },
  { name: "啤酒鱼", location: "大师傅啤酒鱼/谢三姐啤酒鱼", price: "150-200元/2人", tags: ["阳朔特色", "漓江鱼"], description: "漓江鱼配啤酒烹制，西街外分店更实惠" },
  { name: "竹筒饭", location: "龙脊梯田农家乐", price: "30-50元", tags: ["梯田特色", "农家菜"], description: "糯米配腊肉，竹香四溢，龙脊必尝" },
  { name: "椿记烧鹅", location: "桂林/阳朔均有分店", price: "80-120元/人", tags: ["正餐", "招牌"], description: "桂林名菜，皮脆肉嫩，配上蘸料绝配" },
]

// 实用信息
const practicalInfo = {
  bestTime: "五一期间（4月底-5月初）是最佳时节，气候宜人",
  transport: "北京→桂林飞机约2.5小时；桂林两江机场距市区约50分钟车程",
  budget: "人均约3000-4500元（含往返机票、住宿、门票、餐饮）",
  tips: [
    "相公山日出需早起（5:00出发），带手电筒和保暖外套",
    "老寨山日落徒步较险，建议穿防滑运动鞋",
    "龙脊梯田和相公山需爬山，穿舒适运动鞋",
    "遇龙河竹筏建议上午8-10点，水流平缓人少",
    "《印象刘三姐》五一期间票紧张，提前预订",
    "桂林天气多变，备好雨具和防晒"
  ]
}

// 动画变体
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

// 地图图例组件
function MapLegend() {
  const legendItems = [
    { color: '#22c55e', label: '起点/终点' },
    { color: '#ef4444', label: '机场' },
    { color: '#8b5cf6', label: '酒店' },
    { color: '#06b6d4', label: '景点' },
    { color: '#f59e0b', label: '美食' },
    { color: '#f59e0b', label: '日出', icon: 'sunrise' },
    { color: '#f97316', label: '日落', icon: 'sunset' },
  ]

  return (
    <div className="map-legend">
      <div className="legend-title">图例</div>
      <div className="legend-items">
        {legendItems.map((item, idx) => (
          <div key={idx} className="legend-item">
            <div 
              className="legend-dot" 
              style={{ background: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 独立地图组件 - 带天数筛选
function TripMap() {
  const [selectedDay, setSelectedDay] = useState(1)
  const mapRef = useRef(null)

  const markers = useMemo(() => mapMarkersByDay[selectedDay] || [], [selectedDay])
  const viewConfig = mapViewConfig[selectedDay]
  const route = routeLines[selectedDay]

  // 当地图天数切换时，更新地图视野
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current
      map.setView(viewConfig.center, viewConfig.zoom)
    }
  }, [selectedDay])

  return (
    <div className="trip-map-section">
      <div className="trip-map-header">
        <h2 className="section-title">
          <MapPinned size={28} />
          行程地图
        </h2>
        <p className="section-subtitle">点击标签查看每日行程路线</p>
      </div>

      {/* 天数选择标签 */}
      <div className="day-tabs">
        {[1, 2, 3, 4, 5, 6].map(day => (
          <button
            key={day}
            className={`day-tab ${selectedDay === day ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
            style={{
              '--day-color': itinerary[day - 1]?.color || '#06b6d4'
            }}
          >
            <span className="day-tab-number">Day {day}</span>
            <span className="day-tab-title">{itinerary[day - 1]?.title.split('·')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* 地图容器 */}
      <div className="trip-map-container">
        <MapLegend />
        <MapContainer
          ref={mapRef}
          center={viewConfig.center}
          zoom={viewConfig.zoom}
          style={{ height: '100%', width: '100%', borderRadius: '16px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* 渲染标记 */}
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon(marker.type)}
            >
              <Tooltip 
                direction="top" 
                offset={[0, -10]} 
                opacity={1}
                className="custom-tooltip"
              >
                <div className="tooltip-content">
                  <span className="tooltip-name">{marker.name}</span>
                </div>
              </Tooltip>
            </Marker>
          ))}

          {/* 渲染路线 */}
          {route && (
            <Polyline
              positions={route}
              color="#0d7377"
              weight={4}
              opacity={0.8}
              dashArray="12, 8"
              lineCap="round"
            />
          )}
        </MapContainer>
      </div>

      {/* 当日行程概览 */}
      <div className="day-overview" style={{ '--day-color': itinerary[selectedDay - 1]?.color }}>
        <div className="day-overview-header">
          <h3>Day {selectedDay} · {itinerary[selectedDay - 1]?.title}</h3>
          <span className="day-theme">{itinerary[selectedDay - 1]?.theme}</span>
        </div>
        <div className="day-highlights">
          {itinerary[selectedDay - 1]?.highlights.map((highlight, idx) => (
            <span key={idx} className="highlight-tag">{highlight}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// 获取图标
function getIcon(name) {
  const icons = {
    plane: Plane,
    car: Navigation,
    hotel: Hotel,
    walk: MapPin,
    scenic: Mountain,
    food: Utensils,
    culture: FileText,
    night: Moon,
    ticket: Ticket,
    camera: Camera,
    activity: Compass,
    clock: Clock,
    sunrise: Sunrise,
    sunset: Sunset,
    coffee: Coffee,
    shopping: ShoppingBag,
    relax: Sun
  }
  return icons[name] || MapPin
}

// 订票提醒组件
function BookingReminder({ day, color }) {
  const reminders = dayBookingReminders[day]
  if (!reminders || reminders.length === 0) return null

  return (
    <div className="booking-reminder-card" style={{ borderLeftColor: color }}>
      <h4 className="booking-reminder-title">
        <Ticket size={18} />
        当日订票提醒
      </h4>
      <ul className="booking-reminder-list">
        {reminders.map((item, idx) => (
          <li key={idx} className={`booking-item ${item.type}`}>
            <span className="booking-name">{item.name}</span>
            <span className="booking-desc">{item.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 订票信息组件
function BookingSection() {
  const [activeTab, setActiveTab] = useState('urgent')

  return (
    <div className="booking-section">
      <h2 className="section-title">
        <AlertCircle size={28} />
        订票指南
      </h2>

      <div className="booking-tabs">
        <button
          className={`booking-tab ${activeTab === 'urgent' ? 'active' : ''}`}
          onClick={() => setActiveTab('urgent')}
        >
          需提前预订
        </button>
        <button
          className={`booking-tab ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommended')}
        >
          建议预订
        </button>
      </div>

      <div className="booking-list">
        {bookingInfo[activeTab].map((item, idx) => (
          <motion.div
            key={idx}
            className="booking-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="booking-card-header">
              <h4>{item.name}</h4>
              <span className={`urgency-badge ${item.urgency}`}>
                {item.bookInAdvance}
              </span>
            </div>
            <div className="booking-details">
              <p><strong>预订平台：</strong>{item.platform}</p>
              <p><strong>所需信息：</strong>{item.needItems.join('、')}</p>
              <p><strong>参考价格：</strong>{item.price}</p>
              <p className="booking-tips">{item.tips}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// 主应用组件
function App() {
  const [expandedDay, setExpandedDay] = useState(1)
  const [activeNav, setActiveNav] = useState('home')

  return (
    <div className="app">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <Compass className="logo-icon" />
            <span>桂林阳朔</span>
          </div>
          <ul className="nav-links">
            <li><a href="#home" className={activeNav === 'home' ? 'active' : ''} onClick={() => setActiveNav('home')}>首页</a></li>
            <li><a href="#map" className={activeNav === 'map' ? 'active' : ''} onClick={() => setActiveNav('map')}>行程地图</a></li>
            <li><a href="#itinerary" className={activeNav === 'itinerary' ? 'active' : ''} onClick={() => setActiveNav('itinerary')}>每日行程</a></li>
            <li><a href="#food" className={activeNav === 'food' ? 'active' : ''} onClick={() => setActiveNav('food')}>美食</a></li>
            <li><a href="#booking" className={activeNav === 'booking' ? 'active' : ''} onClick={() => setActiveNav('booking')}>订票</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero区域 */}
      <header id="home" className="hero">
        <div className="hero-background">
          <div className="hero-pattern" />
        </div>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">
              <Star className="badge-icon" />
              <span>五一假期 · 六天五晚</span>
            </div>
            <h1 className="hero-title">
              <span className="title-line">桂林阳朔</span>
              <span className="title-line accent">六天五晚深度游</span>
            </h1>
            <p className="hero-subtitle">从龙脊梯田的壮美到漓江的柔情</p>
            <p className="hero-description">
              从龙脊梯田的壮美到漓江的柔情，从日出云海到千里江山图日落，
              一场视觉与心灵的双重盛宴
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">6</span>
                <span className="stat-label">天5晚</span>
              </div>
              <div className="stat">
                <span className="stat-number">10+</span>
                <span className="stat-label">精华景点</span>
              </div>
              <div className="stat">
                <span className="stat-number">2</span>
                <span className="stat-label">城市深度游</span>
              </div>
            </div>
            <button className="cta-button" onClick={() => document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' })}>
              查看行程
              <ArrowRight className="cta-icon" />
            </button>
          </motion.div>
        </div>
        <div className="hero-gradient" />
        <div className="mountain-silhouette" />
      </header>

      {/* 行程地图区域 */}
      <section id="map" className="section">
        <div className="container">
          <TripMap />
        </div>
      </section>

      {/* 行程详情 */}
      <section id="itinerary" className="section itinerary-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">每日安排</span>
            <h2 className="section-title">六天五晚 · 精彩行程</h2>
            <p className="section-subtitle">从桂林市区到阳朔山水，每一天都是不一样的风景</p>
          </div>

          <div className="timeline">
          {itinerary.map((day, idx) => (
            <motion.div
              key={day.day}
              className={`timeline-day ${expandedDay === day.day ? 'expanded' : ''}`}
              style={{ '--day-color': day.color }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div
                className="day-header"
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              >
                <div className="day-number" style={{ background: day.color }}>
                  <span>{day.day}</span>
                </div>
                <div className="day-info">
                  <h3>{day.title}</h3>
                  <p className="day-theme">{day.theme}</p>
                  <div className="day-highlights-preview">
                    {day.highlights.slice(0, 3).map((h, i) => (
                      <span key={i} className="highlight-badge">{h}</span>
                    ))}
                  </div>
                </div>
                <ChevronDown
                  size={24}
                  className={`expand-icon ${expandedDay === day.day ? 'expanded' : ''}`}
                />
              </div>

              <AnimatePresence>
                {expandedDay === day.day && (
                  <motion.div
                    className="day-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookingReminder day={day.day} color={day.color} />

                    <div className="schedule-list">
                      {day.schedule.map((item, i) => {
                        const Icon = getIcon(item.icon)
                        return (
                          <div key={i} className="schedule-item">
                            <div className="schedule-time">
                              <Clock size={14} />
                              {item.time}
                            </div>
                            <div className="schedule-icon" style={{ color: day.color }}>
                              <Icon size={20} />
                            </div>
                            <div className="schedule-activity">{item.activity}</div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="hotel-card" style={{ borderColor: day.color }}>
                      <div className="hotel-header">
                        <Hotel size={20} />
                        <h4>{day.hotel.name}</h4>
                        {day.hotel.stars > 0 && (
                          <div className="hotel-stars">
                            {[...Array(day.hotel.stars)].map((_, i) => (
                              <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="hotel-description">{day.hotel.description}</p>
                      <div className="hotel-features">
                        {day.hotel.features.map((f, i) => (
                          <span key={i} className="feature-tag">{f}</span>
                        ))}
                      </div>
                      {day.hotel.price !== '——' && (
                        <p className="hotel-price">参考价格：{day.hotel.price}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* 美食推荐 */}
      <section id="food" className="section food-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">美食攻略</span>
            <h2 className="section-title">当地美食推荐</h2>
            <p className="section-subtitle">品尝桂林特色美食，感受地道风味</p>
          </div>
          <div className="food-grid">
            {foodRecommendations.map((food, idx) => (
              <motion.div
                key={idx}
                className="food-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <h4>{food.name}</h4>
                <p className="food-location">{food.location}</p>
                <p className="food-description">{food.description}</p>
                <div className="food-tags">
                  {food.tags.map((tag, i) => (
                    <span key={i} className="food-tag">{tag}</span>
                  ))}
                </div>
                <p className="food-price">{food.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 订票信息 */}
      <section id="booking" className="section">
        <div className="container">
          <BookingSection />
        </div>
      </section>

      {/* 实用信息 */}
      <section className="section info-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">出行必看</span>
            <h2 className="section-title">实用信息</h2>
            <p className="section-subtitle">旅行小贴士，让你的行程更顺利</p>
          </div>
          <div className="info-grid">
            <div className="info-card">
              <Sun size={32} />
              <h4>最佳时间</h4>
              <p>{practicalInfo.bestTime}</p>
            </div>
            <div className="info-card">
              <Train size={32} />
              <h4>交通指南</h4>
              <p>{practicalInfo.transport}</p>
            </div>
            <div className="info-card">
              <CreditCard size={32} />
              <h4>预算参考</h4>
              <p>{practicalInfo.budget}</p>
            </div>
          </div>
          <div className="tips-card">
            <h4>
              <AlertCircle size={24} />
              温馨提示
            </h4>
            <ul>
              {practicalInfo.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>桂林阳朔 · 六天五晚深度游攻略</p>
          <p className="footer-sub">愿你的旅程充满美好与惊喜</p>
        </div>
      </footer>
    </div>
  )
}

export default App
