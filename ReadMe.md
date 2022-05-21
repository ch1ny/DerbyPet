# Derby Pet

## 介绍

一款为了能将 **ウマ娘　プリティーダービー** 加入 **Steam** 游玩而使用 **electron** 与 **React.js** 制作的一款赛马娘启动器。

> 本来只是我个人做着玩玩的，没想到视频火了……
>
> 而且还有很多站友希望我能分享给大家……

### 使用建议

<span style="color: red;">出于对 electron 性能及资源占用率的考量，建议暂时不要在使用大型软件（包括游戏）的同时开启本应用。</span>

## 安装

### 方法一、使用 exe 安装程序（推荐）

[点击进入](https://gitee.com/ch1ny/umamusume-driver/releases) Release 页面下载最新版本，~~解压缩后即可使用~~。下载安装包安装完毕后即可使用。

### 方法二、自行编译

> 仅推荐有相关知识储备的同学
>
> 默认看到这里的你已经安装了 nodejs(npm) 或 yarn

进入项目根目录，打开终端，依次执行一下命令：

#### 一、下载依赖

```powershell
# 如果您使用的是 npm
npm install
# 或者您使用的是 yarn
yarn install
```

#### 二、编译代码

```powershell
# 如果您使用的是 npm
npm run dist
# 或者您使用的是 yarn
yarn dist
```

#### 三、运行程序

编译结束后，进入项目根目录下的 `dist/DerbyPet-win32-x64` 文件夹中，双击 `DerbyPet.exe` 即可运行程序。

## 更新日志

<span style="background: dodgerblue; color: white; padding: 10px; font-size: 1.25rem; font-weight: bold">2022-05-20</span>

1. 由于中国大陆对 **jsdelivr** 进行了 DNS 污染，目前无法正常访问原先配置的云端音频文件，因此更换了 CDN 源，但是请求时间会稍长一些，建议用户选择本地音频文件进行配置。
1. 将设置面板由原来的模态屏改为独立窗口

<span style="background: dodgerblue; color: white; padding: 10px; font-size: 1.25rem; font-weight: bold">2022-05-09</span>

1. 项目重构，渲染进程使用 React + TypeScript 的开发方式。

<span style="background: dodgerblue; color: white; padding: 10px; font-size: 1.25rem; font-weight: bold">2022-05-07</span>

1. 移除 v1 版本中的主窗口，仅保留马娘桌宠部分。
2. 发现打包后的马娘桌宠无法自动获取焦点，重写打包命令及 Inno Setup 脚本，使桌宠以管理员身份运行。

<span style="background: dodgerblue; color: white; padding: 10px; font-size: 1.25rem; font-weight: bold">2022-03-04</span>

1. 新增版本 v 1.1.0，大规模重构项目，为项目增添部分功能（仍不完善），并为后续项目远程更新留出接口。

## 其他

~~由于 **DMMPlayer 最新版本**（**5.0.0+**）进行了大规模更新（甚至更换了开发方式），已不支持通过 **URL Scheme** 启动游戏，因此该项目仅建议在低版本（低于 5.0 版本） DMMPlayer 上运行。~~

~~目前 **DMMPlayer** 已强制更新至 **5.0** 以上版本，通过本启动器的 **URL Scheme** 无法做到一键启动游戏，仅能协助使用者快速进入到 DMM 赛马娘界面，仍需用户手动点击启动按钮。~~

> 2022年5月12日更新，感谢B站用户 [@Vitasoy柠檬茶](https://space.bilibili.com/37994425) 在[评论区的提醒](https://www.bilibili.com/video/BV17541197MG#reply112663112832)，现在已经更换新的 URL Scheme ，可以做到一键启动赛马娘了。

~~目前我还没有找到如何正确做到一键启动，DMMPlayer 的源码做了混淆我读不懂 🤯。~~

~~如果有其他开发者知道正确的启动方式的话希望能够不吝赐教。~~

> 这里给自己挖个坑吧，如果大家有兴趣的话我后续会对这个项目进行更新，为该项目添加更多功能，让它至少看上去像一个启动器或是赛马娘工具。
>
> 由于本人目前正值大三下学期[^1]，面临考研以及就业的压力，大部分情况下我会优先考虑我的前途，希望各位能够包容我的这份不负责。（🙇



[^1]:写于2022年5月9日
