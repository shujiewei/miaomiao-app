# 🚀 如何生成 APK（零本地工具，全程浏览器操作）

不需要装 Node、Git、Android Studio——只要有 **GitHub 账号**和**浏览器**就行。

整个流程大约 **15 分钟**，APK 构建本身 **5-8 分钟**（全自动）。

---

## 步骤一览

```
1. 注册 / 登录 GitHub  →  2. 新建仓库  →  3. 拖文件上传
        ↓
4. GitHub Actions 自动构建（5-8 min）  →  5. 下载 APK
        ↓
6. APK 传到安卓设备  →  7. 安装 → 玩！
```

---

## 第 1 步：注册 / 登录 GitHub

打开 [https://github.com](https://github.com)

- **已有账号**：右上角 Sign in 登录
- **没有账号**：点 Sign up，免费注册（邮箱+用户名+密码即可）

---

## 第 2 步：新建仓库

1. 登录后，右上角 **+** → **New repository**
2. 填写：
   - **Repository name**：`miaomiao-app`（或任意名字）
   - **Public** 或 **Private** 都行（Public 免费 Actions 时间无限；Private 每月 2000 分钟，也够用）
   - **不要**勾选"Initialize with a README"（保持空仓库）
3. 点 **Create repository**

---

## 第 3 步：上传所有项目文件

仓库刚建好的页面有一句小字 **"uploading an existing file"**，点它。

或者直接打开网址：
```
https://github.com/你的用户名/miaomiao-app/upload/main
```

### 上传操作

1. 打开 Windows 资源管理器，进入 `C:\Users\shujiewe\miaomiao-app\`

2. 在资源管理器顶部点 **查看 → 显示 → 隐藏的项目**（确保能看到 `.github` 和 `.gitignore`，文件夹/文件名开头有 `.`）

3. **全选** `miaomiao-app` 文件夹里的所有内容（Ctrl+A），包括：
   - `index.html`
   - `package.json`
   - `capacitor.config.json`
   - `.gitignore`
   - `README.md`
   - `HOW_TO_BUILD_APK.md`
   - `src/`（文件夹）
   - `scripts/`（文件夹）
   - `resources/`（文件夹）
   - `.github/`（文件夹，**重要！里面是 CI 配置**）

4. **拖拽**到浏览器的上传区域

5. 等它把所有文件解析好（会显示文件列表）

6. 下方 **Commit changes**：
   - 第一行写：`feat: initial upload`
   - 点绿色按钮 **Commit changes**

> **注意**：拖拽时如果 `.github` 没上传，APK 不会自动构建！如果发现少了，单独再上传一次这个文件夹就好。

---

## 第 4 步：GitHub Actions 自动开工

文件一上传，CI 立刻开始跑。

1. 仓库页面顶部点 **Actions** 标签
2. 看到一个橙色（运行中）或绿色（完成）的任务，名字叫 **Build Android APK**
3. 点进去看进度（不点也没事，会自己跑完）

**正常耗时 5-8 分钟**（第一次因为要下载 Android SDK 久一点）

如果显示 **❌ 红色失败**：点进去看哪一步红了，把截图发给我，我们调一下。

---

## 第 5 步：下载 APK

构建成功（**绿色 ✓**）后：

1. 仍在那个 Action 运行页面
2. **下拉到底**，找到 **Artifacts** 区块
3. 点 **miaomiao-debug-apk** → 自动下载 zip
4. **解压 zip**，得到 `miaomiao-v0.2-debug.apk`

---

## 第 6 步：APK 传到安卓设备

任选一种：

| 方式 | 操作 |
|---|---|
| **OneDrive / 网盘** | 上传 APK 到 OneDrive，手机/平板上下载 |
| **微信文件助手** | 桌面微信发给"文件传输助手"，手机上接收 |
| **USB 线** | 连上手机，复制 APK 到内部存储 |
| **邮箱** | 邮件发给自己，手机打开邮件下载 |
| **二维码** | 用工具把 APK 链接转二维码（如果你能临时托管）|

---

## 第 7 步：在安卓设备上安装

> 因为是 debug 包（没有官方签名），安卓会拦一下。这是**正常的**，不是病毒。

### 步骤

1. **允许"安装未知来源"应用**：
   - **Android 8+**：当你第一次点 APK 时，系统会问"是否允许此来源安装"，点同意即可
   - **更早版本**：进 **设置 → 安全 → 未知来源**，打开

2. 用文件管理器找到 APK 文件 → 点击 → 安装

3. 桌面会出现 **喵喵小百科** 图标（橘猫脸），点开就能玩

> 国产手机（华为/小米/OPPO/vivo）可能再多弹一个"该应用未经检测"的提示，**继续安装** 即可。

---

## ⚠️ 重要：以后装新版前要先卸载旧版

GitHub Actions 每次构建用的 debug 签名是临时随机生成的，所以**新 APK 和上一次的签名不一样**，安卓不允许直接覆盖更新。

**解决办法**：手机/平板上长按旧版"喵喵小百科"图标 → 卸载 → 再装新版即可。

> 之前画的画、领养的猫会丢，因为存在 app 的 localStorage 里。如果想保留进度，告诉我，我们升级到 **固定签名**（让以后构建的 APK 都能直接覆盖）。

---

## 🔄 以后想改了怎么办

只要在 GitHub 网页上：

1. 点要改的文件（比如 `src/data.js`）
2. 右上角 ✏️ 铅笔图标 → 编辑 → 提交
3. Actions 又会自动重新打 APK

或者每次告诉我改什么，我改完后告诉你哪个文件要替换，你在 GitHub 网页上一替换就好。

---

## ❓ 常见问题

### Actions 一直转圈不结束？
GitHub 免费 runner 偶尔会排队，等 10 分钟看看。还卡的话，点 **Cancel** 重新触发：Actions 标签 → 选 workflow → **Run workflow** → Run。

### Build 失败说找不到 Android SDK？
打开 `.github/workflows/build-apk.yml`，确认有 `android-actions/setup-android@v3` 这一步。

### 安装 APK 时说"解析包错误"？
APK 没下完整，重新下载解压 zip。

### 不想公开仓库怎么办？
建仓库时选 **Private** 就行，Private 仓库每月有 2000 分钟免费 Actions（这个 APK 一次构建 5-8 分钟，够你打 200+ 次）。

### 想要正式签名版（去掉"未知来源"警告）怎么办？
告诉我，我会加上签名步骤（需要生成一个 keystore 文件）。debug 版玩玩没问题，但正式分发给其他家长要签名版。

---

## 📞 出问题随时找我

把 **截图** 或 **错误日志** 发给我，我帮你看下哪里卡了。
