---
title: 「node-ngspice」我的ngspice配置
date: 2018-04-24 15:45:21
tags: ["Side Topic"]
---

这是一个最近花了整整一天写的很草率的项目...不过肯定会完善的，至于接下来使用什么前端框架，打算敲定`vue.js`了...
<!--more-->
### Introduction
这学期开了VLSI课程，需要用到 SPICE 软件，老师给的是比较符合中国高校情况的 hspice + 破解软件。怎么说呢，我其实以前也使用盗版软件，但是现在我比较反感破解软件，一是经常不稳定，二是在~~偷窃~~，于是我转而去使用了 ngspice，是一个从 Berkeley SPICE3 fork 出来的开源 spice，也比较受业界认可，所以就它了。但是，它的绘图功能竟然是94年的代码...不能忍呀，于是萌生出了自己写前端的想法

### Overview
> 原本的ngspice界面，emmmm真的丑

![ngspice](./ngspice.png)

> 新的前端✨

![node-ngspice_0](./screenshot.jpg)

这个还只是一个demo，我希望之后用`vue.js`重写前端，顺便把后端的子进程改掉，需要hack一下`ngspice`的代码，项目地址在[node-ngspice](https://github.com/higuoxing/node-ngspice)。

#### 2019.06.17 Update: ⚠️ 实在写不进去了，已经弃坑
