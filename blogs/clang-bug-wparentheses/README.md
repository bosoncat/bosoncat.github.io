---
title: clang Wparentheses 的一个 BUG
date: 2018-06-01 00:08:38
tags:
---

## [ clang ] Wparentheses 的一个 BUG

最近在看一点编译器的东西，感觉很神奇，本来想自己实现一个玩具的编译器，但是还是因为时间不足所以暂时搁置了，就一直在看一点有关 `LLVM` 的科普文。`LLVM` 真是个神奇的东西，这里推荐一个有趣教程 [Kaleidoscope-Implementing a Language with LLVM](http://llvm.org/docs/tutorial/index.html)，从简单的 `Lexer` 到 `AST` 再到后面的 `JIT` 都搞得十分有趣，特别值得一看。

今天在逛论坛时，看到了有人在 `2014` 年报了这样一个 `BUG`，原贴在[Bug 18971 - Missing -Wparentheses warning](https://bugs.llvm.org/show_bug.cgi?id=18971)

> [Update 2018/06/04] 我已经提交了 `PATCH`，目前等待有人帮我 `commit`: [fix: \[Bug 18971\] - Missing -Wparentheses warning](https://reviews.llvm.org/D47687)

```bash
$ cat tmp/warning/a.cc
#include <cassert>
bool x;
int val;
void foo() {
  assert(x && val == 4 || (!x && val == 5));
}

$ gcc-4.8.2-inst/bin/g++ -c tmp/warning/a.cc -Wall -o a.o
In file included from /gcc-4.8.2-inst/include/c++/4.8.2/cassert:43:0,
                 from tmp/warning/a.cc:1:
tmp/warning/a.cc: In function ‘void foo()’:
tmp/warning/a.cc:5:12: warning: suggest parentheses around ‘&&’ within ‘||’ [-Wparentheses]
   assert(x && val == 4 || (!x && val == 5));
            ^
$ ./bin/clang++ -c tmp/warning/a.cc -Wall -o a.o
```

大致意思是因为在 `C++` 中 `&&` 的优先级要高于 `||`，为了让程序员留神自己的逻辑问题，所以在 `gcc` 中会给出一个 `Warning`，但是在 `clang` 中却没有给出一个 `Warning`，但其实根据我的分析，`clang` 理论上是会给出一个 `Warning`，比如我们这样来测试

```cpp
void foo(bool b) {
  /* do nothing */
}

foo(x && val == 4 || (!x && val == 5));
```

这个的确是会抛出一个 `Warning`，而且很明确的建议我们加括号来强调一下我们的逻辑

```bash
a.cc:20:9: warning: '&&' within '||' [-Wlogical-op-parentheses]
  foo(x && val == 4 || (!x && val == 5));
      ~~^~~~~~~~~~~ ~~
a.cc:20:9: note: place parentheses around the '&&' expression to silence this
      warning
  foo(x && val == 4 || (!x && val == 5));
        ^
      (            )
1 warning generated.
```

这就有点奇怪了，理论上应该是可以抛出一个 `Warning` 的呀！于是去看了下 `clang` 的这部分代码。我找到这部分比较关键的代码在 `clang/lib/Sema/SemaExpr.cpp`

```cpp
/// DiagnoseBinOpPrecedence - Emit warnings for expressions with tricky
/// precedence.
static void DiagnoseBinOpPrecedence(Sema &Self, BinaryOperatorKind Opc,
                                    SourceLocation OpLoc, Expr *LHSExpr,
                                    Expr *RHSExpr){
//// Some codes ...

  // Warn about arg1 || arg2 && arg3, as GCC 4.3+ does.
  // We don't warn for 'assert(a || b && "bad")' since this is safe.
  if (Opc == BO_LOr && !OpLoc.isMacroID()/* Don't warn in macros. */) {
    DiagnoseLogicalAndInLogicalOrLHS(Self, OpLoc, LHSExpr, RHSExpr);
    DiagnoseLogicalAndInLogicalOrRHS(Self, OpLoc, LHSExpr, RHSExpr);
  }

//// Some other codes
}
```

注意到判断 `&&` 是否被包含于 `||` 的函数中的 `if (Opc == BO_LOr && !OpLoc.isMacroID()/* Don't warn in macros. */)` 也就是说，如果这玩意是在 `macro` 中，它就不会产生一个 `Warning` 了。而 `assert()` 函数的确是一个 `macro`，它的声明在[这里](http://en.cppreference.com/w/cpp/error/assert) 可以查看。

```cpp
#ifdef NDEBUG
#define assert(condition) ((void)0)
#else
#define assert(condition) /*implementation defined*/
#endif
```

也就是说 `assert` 是一个在 `<cassert>` 中的一个 `macro`...这下就解释的通了，下面验证了一下，把一个函数定义到 `macro` 中，像这样

```cpp
#define bar(x) \
  ( \
    ( std::cout << x ) \
  )

bar(x && val == 4 || (!x && val == 5));
```

这下，我们的 `bar()` 也跟 `assert()` 一样了，编译并不会给我们 `Warning` 了。

### Solution

解决办法呢，很简单，删掉源码的 `&& !OpLoc.isMacroID()` 就好了。看了下记录好像是 `2010` 年左右的一个没有经过 `review` 直接 `commit` 的一段代码...

### Reference

[0] [Bug 18971 - Missing -Wparentheses warning](https://bugs.llvm.org/show_bug.cgi?id=18971)

[1] [assert - cppreference](http://en.cppreference.com/w/cpp/error/assert)
