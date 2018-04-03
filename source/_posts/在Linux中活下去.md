---
title: 在Linux中活下去
date: 2018-03-25 02:58:34
tags:
---

本文是一篇安利软文，目的是能够时常更新一些顺手的工具或者小技巧，以及更重要的是让更多的人拥抱小企鹅
<!--more-->
> Linux is for everyone!

### Introduction
从最初的Ubuntu14.04LTS, Ubuntu16.04LTS，Arch Linux，再到Fedora 27，自己也算反反复复安装了n次系统了，从小白到刚刚入门也学了很多东西，本篇文章叫做在Linux中活下去，其实是要在Linux中活的更好...以下工具其实很多是跨平台的，但是之所以想安利Linux是因为对于Linux中，很多东西仅仅依靠一个配置文件就会很强大，当然，是有学习成本的，但是我觉得为了后半生能够过得开心，这个学习成本是值得的。并且，有成百上千的爱好者每天都在不停地为这些软件打patch，你难道真的不想试一下吗？与其在Windows下挣扎破解各种十分封闭的的软件，不如去尝试开源且强大的软件...至于像NI这些只生产仅仅支持Windows的软件，我是没有办法的，所以如果你是这类用户，那么当我没说

### Tools
以下是对一些十分有用的工具的安利，本科专业是EE所以会多一些专业相关的工具

#### Chat
即时通信我个人还是喜欢[Telegram](https://telegram.io)还是能找到一些心仪的group的，以及IRC的HexChat也不错...

#### Editor
对于文档编辑，撸代码的工具，其实有很多种选择，像大多数人的Emacs，Vim已经十分够用了，对于不喜欢这两种有学习成本的同学，还有无限续杯的[Sublime](https://www.sublimetext.com/)，完全免费的[Atom](https://atom.io)，[VSCode](https://code.visualstudio.com/)

对于习惯使用MS-Word的用户，不妨真的去学习一下LaTex，你发现所有的东西都是按照自己的意愿来的，你可以按照自己的想法去控制每一个像素点的对齐，难道不是很棒吗？如果这个成本太高，完全可以去使用Google doc去编辑文档，完全免费，十分强大，而且，你只要一个浏览器就够了！另外，Markdown的用户可以去试试[Typora](https://typora.io)也是很不错的。以及俗称文档界的瑞士小军刀[Pandoc](https://pandoc.org)。
至于制作所谓的PPT，拜托这都8102年了，有什么不是一个浏览器能够解决的？安利[reveal.js](https://revealjs.com/)，[WebSlides](https://webslides.tv/#slide=5)给你，Slides重要的是它的内容，而不是一坨没用的修饰品飞来飞去！当然，写几句Js脚本完全是可以做出更酷的效果

对了，我喜欢fcitx框架，而且可以使用[搜狗输入法](https://pinyin.sogou.com/linux/?r=pinyin)，目前还是很不错的，很赞！

#### Languages
##### Editor
对于写代码，我觉得当前最搞笑的，最讽刺的是在21世纪推行VC6.0的那一套东西。再不济Visual Studio都做不到吗？
在Linux下我们有各种Editor的各种插件来辅助工作！比如Vim 的YCM插件补全代码，以及NerdTree，Taglist这类辅助浏览的插件，甚至一些重量级配置的Vim IDE:[spf-13](https://github.com/spf13/spf13-vim)，至于Emacs，它已经被称作一个操作系统了，因为我没有使用过，所以就不介绍了。
> 我的仅仅不到100行配置的轻量级[Vim](https://github.com/higuoxing/dotfiles)
![my-vim](./my_vim.gif)

##### Interactive Programming
见多少人为了学习Python由于一些小小的环境变量问题搞得焦头烂额，最后不得不放弃。很多东西的作者本身就是Linux的使用者或者贡献者，他们的东西当然是对Linux的支持最好！只需要一个Python内核再加一个[Jupyter](http://http://jupyter.org/)就够了！除此之外，Jupyter还支持Scala，Haskell这些内核，打开浏览器就可以交互编程，想想都十分开心！

##### Science computing
Matlab是一个十分强大的软件，但是很多时候，我仅仅需要画一个三维函数而已，我并不希望等10秒的启动时间，那么安利一下[plotly](https://plot.ly/)，支持多种语言，个人比较喜欢用Js+浏览器运行不太大的图，十分好用，比如我的[课程作业](https://higuoxing.com/modern_optics)

#### Hardware
对于硬件设计...自己学的比较多的算是写HDL吧，画PCB板实在不懂，不过去订阅一些开源的邮件列表，会有人告诉你当前比较先进的软件的，说白了这些就是一个工具，方便使用而已了。每每看到老师们还在使用Xilinx的那一套工具链，开着Vivado仿真写着最基础的Verilog接口，呵呵。
对于HDL，也尝试了比较多的工具，这里还是给Xilinx点个赞吧，毕竟Vivado和ISE是2个为数不多的跨平台软件，至于仿真，Vivado真的太慢了，这里推荐[Verilator](https://www.veripool.org/wiki/verilator)+gtkwave，百分百开源而且verilator宣称比verdi还要快。更重要的是它支持Verilog和SystemVerilog的仿真，使用C++编写bench文件，稍微熟悉一下make这一套东西使用起来是十分舒服的。除此之外有[cocotb](http://cocotb.readthedocs.io/en/latest/introduction.html)是一个Python的仿真软件，配合iverilog十分强大，简单，易用。另外还有[Chisel](https://chisel.eecs.berkeley.edu/)，它是UCB搞出来，使用Scala编写HDL然后生成verilog代码，更重要的是，真的省了一大笔时间！再也不用一个又一个的修改功能相近但是参数不同的verilog模块了！十分值得拥有，毕竟，Risc-V也是拿它写的。贴一个比较简单的4抽头FIR滤波器你就知道它的代码是多简单明了了。
```scala
class FirExample(b0: Int, b1: Int, b2: Int, b3: Int) extends Module {
  val io = IO(new Bundle {
    val in  = Input(UInt(8.W))
    val out = Output(UInt(8.W))
  })
  val x_n1 = RegNext(io.in, 0.U)
  val x_n2 = RegNext(x_n1, 0.U)
  val x_n3 = RegNext(x_n2, 0.U)
  io.out  := io.in * b0.U(8.W)
    x_n1 * b1.U(8.W) +
    x_n2 * b2.U(8.W) +
    x_n3 * b3.U(8.W)
}
```
