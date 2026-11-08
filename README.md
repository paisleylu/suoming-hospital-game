# 索命诡院 (Suoming Hospital)

第一人称 3D 中式悬疑解谜 / 潜行恐怖网页游戏。探索 1998 年被封锁的仁安医院第七病区、搜寻钥匙、破解病历密码，在 26 位特征各异的怨灵追逐下寻找生路。

🎮 **在线立即游玩：** [https://paisleylu.github.io/suoming-hospital-game/](https://paisleylu.github.io/suoming-hospital-game/)

---

## 📱 操作指南与设备兼容

* **电脑端**：键盘 `WASD` 移动，鼠标移动转动视角，`Shift` 奔跑，`E` 调查/拾取/抱人，`Q` 抛投击倒怨灵，`F` 开关手电，`R` 更换电池，`H` 躺床伪装（长按 `空格` 平息心率），`J` 查阅笔记，`M` 开启地图，`ESC` 暂停。
* **平板与手机端**：横屏自适应，左下方自动生成虚拟摇杆，右侧滑动旋转视角，右下角配有高触感动作按钮。

---

## 📁 规范化项目目录

本仓库采用现代模块化前端结构，告别散乱文件堆积：

```text
网页版/
├── index.html                 # 启动入口、医疗风格进度条与 UI 容器
├── AGENTS.md                  # AI 协同开发指南与准则
├── product.md                 # 完整产品设计文档 (PRD、26鬼图鉴、玩法全解析)
├── design.md                  # 美术风格规范 (色彩、排版、氛围、音效体系)
├── .agents/skills/            # 游戏引擎开发与现代 Web 前端技能库
├── src/                       # 游戏核心业务逻辑 (game.js, mobile-controls.js...)
├── assets/                    # 贴图与音频数据 (assets.js, scare-assets.js...)
├── data/                      # 3D 几何顶点与模型切片 (characters, scenes, headmesh)
├── lib/                       # 第三方依赖库 (three.min.js)
└── credits/                   # 媒体素材版权与许可协议说明
```

---

## 🛠 本地调试与开发

1. **启动本地服务器**：
   ```bash
   python3 -m http.server 8000
   ```
2. **浏览器预览**：访问 `http://localhost:8000/`。
3. **AI 辅助协作**：请参阅 [`AGENTS.md`](./AGENTS.md) 了解代码红线与规范。
4. **游戏机制与设定**：详见 [`product.md`](./product.md) 与 [`design.md`](./design.md)。
