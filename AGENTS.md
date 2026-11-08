# 索命诡院 · AI 协同开发指南 (AGENTS.md)

欢迎来到《索命诡院》（Suoming Hospital）的开发工作区。本项目是一个使用 **Three.js** 开发的第一人称 3D 中式复古悬疑/恐怖 H5 网页游戏，专为电脑、平板和手机全端优化。

---

## 1. 核心工程哲学与教学关怀

1. **小开发者友好 (Kid & Family Friendly)**：
   - 沟通使用亲切、生动、通俗易懂的中文，避免堆砌晦涩难懂的行话。
   - 用直观比喻解释复杂 3D 概念（如：顶点是小珠子，Mesh 是小木偶，Texture 是彩绘皮肤，Extrude 是拉长面团）。
2. **专业级工程规范 (Engineering Rigor)**：
   - 虽然是面向孩子和新手的项目，但项目架构必须保持**现代化、模块化、高可读性**。
   - 严禁将几何顶点、贴图数据、业务逻辑一团乱麻地堆放在项目根目录。
3. **全端单一源码原则 (Single Source of Truth)**：
   - 网页版是唯一维护主线，同时兼容电脑端（键盘鼠标）与移动端（触屏虚拟摇杆）。
   - 严禁擅自建立冗余的分支平台（如单独分化无法自动更新的离线本地包），确保改动一键部署到 GitHub Pages 全端即刻生效。

---

## 2. 目录规范与职责边界

```text
网页版/
├── index.html                 # 游戏启动入口、加载器与核心 UI 容器
├── README.md                  # 项目公开说明与网页版入口
├── AGENTS.md                  # AI 协同开发准则与技术规约（本文件）
├── product.md                 # 产品策划文档（世界观、玩法机制、难度等级、26鬼图鉴）
├── design.md                  # 视觉与美术设计规范（中式复古医院美学、UI、音效）
├── .agents/
│   └── skills/                # 专属技能包
│       ├── suoming-engine/    # 3D 引擎、场景坐标与碰撞逻辑开发技能
│       └── modern-web-polish/ # 现代 Web 美化、触控体验与移动端适配技能
├── src/                       # 核心业务与控制代码
│   ├── game.js                # 游戏主逻辑、医院场景构建、剧情与碰撞
│   ├── mobile-controls.js     # 移动端触屏摇杆与动作按键响应系统
│   ├── portrait-ghosts.js     # 26 种不同体态鬼怪的装配与生成算法
│   └── scare-gallery.js       # 突脸调度器与预加载器
├── assets/                    # 媒体资源库（Base64 字典）
│   ├── assets.js              # 场景建筑材质贴图数据
│   ├── scare-assets.js        # 突脸与肖像贴图数据
│   └── scare-audio.js         # 14 种尖叫音效波形与 WebAudio 播放器
├── data/                      # 3D 几何模型与网格切片
│   ├── headmesh.js            # 扫描人头掉落网格
│   ├── scene-models.js        # 场景预置 3D 模型定义
│   ├── scene-part-*.js        # 轮椅、病床、药品柜切片
│   ├── closed-characters.js   # 角色顶点容器数组
│   ├── character-part-*.js    # 角色人体网格分块切片
│   └── character-2/           # 细分 2 号病患的顶点/法线/UV几何数据
├── lib/                       # 第三方引擎库
│   └── three.min.js           # Three.js 核心渲染库 (r128+)
└── credits/                   # 开源素材与授权来源
    ├── AUDIO-CREDITS.txt      # 音频创作授权归属
    └── MODEL-CREDITS.txt      # 3D 几何模型开源协议
```

---

## 3. 必须遵守的技术红线 (Technical Rules)

### 3.1 变量声明的“幂等性”原则 (Idempotency)
移动端（微信内置浏览器、BFCache 缓存、弱网重试）可能会多次执行同一个脚本。**严禁在全局作用域使用裸 `const xxx = ...` 声明大对象**，必须使用挂载在 `window` 上的安全防冲突模式：
```javascript
// ✅ 正确范式：
var imageAssets = window.imageAssets = window.imageAssets || {};
Object.assign(window.imageAssets, { ... });

// ❌ 严禁范式（会导致二次执行报 SyntaxError: Identifier has already been declared）：
const imageAssets = { ... };
```

### 3.2 保持双端控制并存 (Dual Controls Parity)
- 键盘（WASD、Shift 奔跑、E 拾取/抱起、Q 抛投、F 手电、R 换电池、H 伪装/躲藏、J 笔记、M 地图、ESC 暂停）必须与触屏虚拟摇杆、动作按钮完全等价。
- 修改交互逻辑时，必须同时兼顾键盘事件与 `mobile-controls.js` 的 `keyEvent()` 映射，绝不能破坏触控操作。

### 3.3 性能与加载预算
- 渲染缩放：保持 `renderScale` 在移动设备上的自适应控制，避免高分辨率视网膜屏幕出现掉帧。
- 资源大小：任何新增图片或模型必须经过压缩；加载时必须支持 `index.html` 的断点重试与线路切换。

---

## 4. 本地测试与 Git 提交流程

1. **本地测试验证**：
   ```bash
   cd "/Users/yutian/Documents/游戏项目/索命诡院/网页版"
   python3 -m http.server 8000
   ```
   在浏览器访问 `http://localhost:8000/`，确保进度条能平稳跑至 100%，点击“进入医院”可正常启动场景与控制。
2. **规范提交信息**：
   - 每次提交只包含与当前任务相关的改动。
   - 提交信息必须通俗易懂，例如：`增加护士站药柜密码线索提示`、`美化移动端加载进度条样式`。
3. **推送至 GitHub Pages**：
   - 先 `git pull origin main`，再 `git push origin main`。
   - 等待 GitHub Actions 完成静态构建，在线验证网址：[https://paisleylu.github.io/suoming-hospital-game/](https://paisleylu.github.io/suoming-hospital-game/)。
