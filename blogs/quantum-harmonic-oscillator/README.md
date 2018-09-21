---
title: '[量子力学]谐振子模型'
date: 2017-08-17 14:27:47
tags:
---

## [量子力学]谐振子模型

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/github-markdown-css/2.2.1/github-markdown.css"/>

今天新开了博客！！为了测试博客`Markdown`的解析效果（尤其是数学公式），所以会把自己之前写的奇奇怪怪的东西发上来测试...这篇是呃，怎么说呢，随便扯扯上学期学到的。

<!--more-->

物理应该是美妙的，并且物理定律应该是某种美丽的形式，我不太喜欢书中的线性谐振子模型的推导方式，所以参考了一些书之后，（尤其是格里菲斯的量子力学）总结出来了一个我个人认为比较能够从量子力学的角度去考虑的一个推导过程。由于教材中厄米多项式过于复杂，这里没有其他的意思，只是单纯地没有完全理解厄米多项式，所以希望自己能够在将来明白这些东西的意义，`Ladder Operators`是一个很好的方法，它就像`Haviside`引入p算子来计算微分方程一般神奇，它将复杂的波函数化简求解，就连格里菲斯本人也在书中写道：`...because it is quicker and simpler (and a lot more fun)`，这里就给出一个比较利于理解的过程。

根据线性谐振子的模型，我们知道这个系统的势为：

$V(x) = \frac{1}{2}m\omega^{2}x^{2}$

写成不含时薛定谔方程就是：

$-\frac{\hbar^{2}}{2m}\frac{d^{2}\psi}{dx^{2}}+\frac{1}{2}m\omega^2\psi=E\psi$

我们令$p=(\hbar/i)d/dx$ 整理为更为紧凑的形式：

$\frac{1}{2m}[p^{2}+(m\omega x)^{2}]\psi = E\psi$

这样，哈密顿算子就可以写为：

$H=\frac{1}{2m}[p^{2}+(m\omega x)^{2}]$

到这里我们先停一下，考虑这样一个复数乘法：

$u^{2}+v^{2}=(iu+v)(-iu+v)$

在我们得到的哈密顿算子中，$p$ 和 $x$ 也都是算子，但是考虑算子时我们不能太草率，因为算子通常会有对易与否的问题（这一点我们稍后考虑），我们是不是可以像上面的复数一样构造一个类似的哈密顿算子？先构造两个算子 $a_+$ 和 $a_{-}$

$a_{\pm}=\frac{1}{\sqrt{2\hbar m \omega}}(\mp ip+m\omega x)$

将它们相乘可以得到：

$a_{-}a_{+}=\frac{1}{2\hbar m \omega}(ip+m\omega x)(-ip+m\omega x)$

$=\frac{1}{2\hbar m \omega}[p^2+(m \omega x)^{2}-im\omega (xp-px)]$

根据对易算子的定义：

$[A, B]=AB-BA$

所以，$a_{-}a_{+}$ 就可以写成：

$a_{-}a_{+}=\frac{1}{2\hbar m \omega}[p^{2}+(m\omega x)^{2}]-\frac{i}{2\hbar}[x, p]$

根据$x$和$p$算子的对易关系可知：

$[x, p] = i\hbar$

所以$a_{+}a_{-}$就可以写成

$a_{-}a_{+}=\frac{1}{\hbar \omega}H+\frac{1}{2}$

同样我们可以得到$a_{+}$和$a_{-}$的对易关系：

$[a_{-}, a_{+}] = 1$

哈密顿算子也可以写为：

$H=\hbar \omega(a_{+}a_{-}+\frac{1}{2})$

薛定谔方程就可以改写为：

$\hbar \omega(a_{\pm}a_{\mp}\pm\frac{1}{2})\psi=E\psi$

看到上面化简的薛定谔方程是不是简单多了？下面就要证明两个等式：$H(a_{+}\psi)=(E+\hbar \omega)(a_{+}\psi)$和$H(a_{-}\psi)=(E-\hbar \omega)a_{-}\psi$并会阐明它们的物理意义。我们把上面构造的$a_{+}$和$a_{-}$算符叫做Ladder Operator，这样就很形象了，薛定谔方程解出来的特征值刚好就是能量本征值，我们先从直观的感觉上看下这两个式子，当$a_{+}$作用到波函数上时，能量本征值就被抬升了$\hbar \omega$，当$a_{-}$作用到波函数上时，能量本征值就被降低了$\hbar \omega$。下面来证明这两个等式：

$H(a_{+}\psi)=\hbar \omega(a_{+}a_{-}+\frac{1}{2})(a_{+}\psi)=\hbar \omega(a_{+}a_{-}a_{+}+\frac{1}{2}a_{+})\psi$

$=\hbar \omega a_{+}(a_{-}a_{+}+\frac{1}{2})\psi=a_{+}[\hbar \omega(a_{+}a_{-}+1+\frac{1}{2})\psi]$

$=a_{+}(H+\hbar \omega)\psi=a_{+}(E+\hbar \omega)\psi=(E+\hbar \omega)(a_{+}\psi)$

同理可得：

$H(a_{-}\psi)=\hbar \omega(a_{-}a_{+}-\frac{1}{2})(a_{-}\psi)=\hbar \omega(a_{-}a_{+}a_{-}-\frac{1}{2}a_{-})\psi$

$=\hbar \omega a_{-}(a_{+}a_{-}-\frac{1}{2})\psi=a_{-}[\hbar \omega(a_{-}a_{+}-1-\frac{1}{2})\psi]$

$=a_{-}(H-\hbar \omega)\psi=a_{-}(E-\hbar \omega)\psi=(E-\hbar \omega)(a_{-}\psi)$

就像前面所说的那样$a_{+}$算子可以将本征能量抬升$\hbar \omega$，$a_{-}$可以将本征能量降低$\hbar \omega$。所以算符$a_{+}$也叫`raising operator`，算符$a_{-}$也叫`lowering operator`。现在我们得到了一对新的算符，个人觉得这个过程很神奇，我们并没用用十分复杂的数学工具，仅仅是量子力学的一些基本假设就得到了这些东西。

现在我们就要考虑一个更为有趣的东西，当我们对一个波函数反复运用`lowering operator`呢？当它的能量降到不能再降呢？这时候就应该到这个粒子的基态能级了（基态能量无法再被降低，所以算子作用后概率密度为0，我只这样理解的）。所以：

$a_{-}\psi _{0}=0$

带入我们之前得到的lowering operator：

$\frac{1}{\sqrt{2\hbar m\omega}}(\hbar \frac{d}{dx}+m\omega x)\psi _{0}=0$

现在我们得到了一个简单的微分方程，并可以对其求解：

$\frac{d\psi_{0}}{dx}=-\frac{m\omega}{\hbar}x\psi_{0}$

$\int\frac{d\psi_{0}}{\psi_{0}}=-\frac{m\omega}{\hbar}\int xdx$

$ln\psi_{0}=-\frac{m\omega}{2\hbar}x^{2}+constant$

$=>\psi_{0}(x)=Ae^{-\frac{m\omega}{2\hbar}x^{2}}$

利用归一化性质，即可求得$A^2=\sqrt{\frac{m\omega}{\pi \hbar}}$

$=>\psi_{0}=(\frac{m \omega}{\pi \hbar})^{1/4}e^{-\frac{m\omega}{2\hbar}x^{2}}$

$=>E_{0}=\frac{1}{2}\hbar \omega$

接下来，我们只需要对基态的波函数反复利用`raising operator`就可以得到其它态的波函数了：

$\psi_{n}=A_{n}(a_{+})^{n}\psi_{0}$

$E_{n}=(n+\frac{1}{2})\hbar \omega$

我们的推导到这里就结束了，上面的推导并不困难，每一步都十分的清晰，我们最终将一个复杂的高次微分方程，利用物理的实际意义化简成了一个一次的微分方程，其实这里所做的一切与级数求解的方法是一样的，只不过一种被称为`Analytic Method`，一种被称为`Algebraic Method`。两种方法实际上是同一种物理模型的不同数学描述方式而已。

我本身是十分喜欢物理的，而且吴院在这学期开设量子力学课程我是十分开心的，有一点点略微失望的是，量子力学分到的课时太少了，本来期望老师能够涉及一些纠缠态的东西，科普也好，但是由于大二下属于一个十分繁忙的阶段，模电，微机，电磁场，所以如果一门心思的扑倒量子力学上面也不太现实，但是，学习是无止境的，之前有个1万字的学习笔记是我利用了三天假期总结了我这学期看的一些科普书籍或者课外教材，总的来说有所收获，将来有机会我也会继续投一些时间到物理上面。更何况物理也是近一个世纪借助科学技术有了很大的突破，没有了解到近代物理，仿佛活在了上个世纪，这篇拙作就作为课程大作业吧，虽然要写研讨类或者综述类的文章，但是我发现我更喜欢学着费曼物理讲义的语气分享我的学习经历。
