---
name: modern-web-polish
description: 现代 Web 前端美化、移动端触控优化、PWA/离线化与 WebGL 性能调优技能。
---

# 现代 Web 美化与触控交互最佳实践 (Modern Web Polish Skill)

本技能提供移动端触控人体工学、加载流程视觉美化、WebGL 渲染性能调控及跨平台响应式布局指导。

---

## 1. 移动端触控人体工学最佳实践 (`src/mobile-controls.js`)

1. **虚拟摇杆设计**：
   - 采用左下角固定半透明底盘（直径 132px），拇指中心摇杆（直径 55px）。
   - 设置最大移动半径为 43px，死区阈值设为 14px，防止拇指轻微抖动造成角色漂移。
   - 必须使用 `PointerCapture` 防止多点触控时指针滑出底盘后丢帧。
2. **动作按钮区布局**：
   - 右下角采用环状扇形/阶梯式布局，核心主动作（如 `E 互动`）使用醒目的高对比度红褐色背景（`.act` 类）。
   - 保持单个按钮触控面积不低于 `44px × 44px`（符合 WCAG 移动无障碍标准）。
   - 需要持续按住的动作（如 `Shift 奔跑`、`空格 稳心率`）必须正确绑定 `pointerup` 与 `pointercancel` 事件。

---

## 2. 网页加载体验与视觉美化

1. **复古医疗监护仪风格进度条**：
   - 加载界面采用暗绿色病房基调（`#08100e`）搭配微光阴影（`text-shadow: 0 0 35px #8ba99b55`）。
   - 进度条显示当前文件名与精准百分比，消除用户“卡死或断网”的焦虑。
   - 全部素材下载完成后，按钮呈现呼吸光晕动效（`ready-pulse`）。
2. **移动端手势解锁音频流**：
   - iOS Safari 与 Android Chrome 会阻止脚本自动播放音频。
   - 必须在用户点击“进入医院”按钮的手势回调中，唤醒并恢复 `AudioContext` 状态：
     ```javascript
     if (audioContext && audioContext.state === 'suspended') {
       audioContext.resume();
     }
     ```

---

## 3. WebGL 渲染性能预算

- **动态分辨率缩放 (`renderScale`)**：
  为避免 2K/3K 手机高分屏导致的着色器过载掉帧，使用动态夹逼算法：
  ```javascript
  let renderScale = Math.min(devicePixelRatio, 0.85, Math.sqrt(1000000 / (innerWidth * innerHeight)));
  renderer.setPixelRatio(renderScale);
  ```
- **贴图各向异性过滤**：
  将 `anisotropy` 限制在 `Math.min(8, renderer.capabilities.getMaxAnisotropy())`，既保证地砖远景不模糊，又避免低端 GPU 产生填充率瓶颈。

