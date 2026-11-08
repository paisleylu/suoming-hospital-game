# 索命诡院

第一人称医院恐怖游戏：探索病房与迷宫、搜寻钥匙、破解谜题，在逐渐出现的追逐者中寻找出口。提供安心探索、不同恐怖难度、不死开关和突脸开关。

**网页版体验地址：** [https://paisleylu.github.io/suoming-hospital-game/](https://paisleylu.github.io/suoming-hospital-game/)

平板建议横屏：左侧摇杆移动，右侧滑动调整视角，屏幕按钮用于互动、奔跑、手电等操作。游戏素材较大，第一次打开需要等待加载完成。页面提供素材下载重试；不同设备的 3D 性能和网络环境可能不同。

## 文件和版本

- `index.html`：开始界面与按顺序加载素材的逻辑。
- `game.js`：医院场景、故事、交互、追逐和难度。
- `mobile-controls.js`：平板触控操作。
- `three.min.js`、`scene-*.js`、`character-*.js`：3D 引擎和场景、角色素材。
- `assets.js`、`scare-assets.js`、`scare-audio.js`：图片与音频资源；来源说明见 `AUDIO-CREDITS.txt`、`MODEL-CREDITS.txt`。

此仓库是网页版。桌面 Mac 应用是单独版本，修改本仓库不会自动更新它。`main` 分支用于 GitHub Pages：在本地测试后再提交、推送，推送成功后网页会更新。

## 本地预览

在仓库目录运行 `python3 -m http.server 8000`，然后在浏览器打开 `http://localhost:8000/`。按 Ctrl+C 停止预览。开始按钮会在素材加载完成后启用。

仓库公开，请勿提交密码、验证码、私钥或不希望公开的个人资料。第三方素材请保留对应的来源及许可说明。
