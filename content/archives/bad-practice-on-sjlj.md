---
title: "SjLj (setjmp/longjmp) 一次错误的使用"
date: 2019-06-15T17:28:14+08:00
tags: ["C"]
---

前几天在为一个关于 LLVM IR 的[教程](https://mapping-high-level-constructs-to-llvm-ir.readthedocs.io/en/latest/) 升级语法的时候，发现教程中使用 `SjLj` 的地方有点小问题。

<!--more-->

### 简介

在教程中，有一段代码是这样的，作者直接将一个指向 `%Exception` 类型的指针的地址转为了 `i32` (32 位的整数)，然后传递给了 `longjmp()` 函数。后面在使用这个指针的时候还要利用 `inttoptr` 来恢复这个指针。[源代码](https://github.com/f0rki/mapping-high-level-constructs-to-llvm-ir/blob/master/exception-handling/listings/setjmp_longjmp.ll)

```llvm
...
%5 = ptrtoint %Exception %3 to i32
call void @longjmp(%jmp_buf* %throw, i32 %5)
...
%status = call i32 @setjmp(%jmp_buf* %env)
...
%6 = inttoptr i32 %status to %Exception*
```

这样做的问题在于没办法在 64 位系统中 (指针为 64 位)，运行以上代码，而且在程序中以整数的形式来传递指针是很危险的。这一点也向作者得到了[考证](https://github.com/f0rki/mapping-high-level-constructs-to-llvm-ir/issues/30)

### 使用 SjLj 进行异常处理

事实上，`SjLj` 在 C 中作为异常处理的使用还算比较常见。通常在有可能产生异常的地方调用 `setjmp(jmp_buf env);` 将寄存器的信息保存到 `jmp_buf env` 中，然后在抛出异常的地方调用 `longjmp(jmp_buf env, int val);` 恢复寄存器信息，回到调用 `setjmp()` 的地方，并且 `int val` 会作为 `setjmp()` 的返回值。通常我们会使用 `int val` 来传递 `error_code` 而不是指针地址。一个简单的例子

```C
#include <setjmp.h>
#include <stdio.h>

static jmp_buf env;

void throw_exception() {
    longjmp(env, 42);
}

void first() {
    throw_exception();
}

int main() {
    int status = setjmp(env);
    if (status == 0) {
        // try first()
        first(); // throw exception
        // never reach
    } else {
        // catch exception
        fprintf(stderr, "Exception caught, error code: %d\n", status);
    }

    return 0;
}
```

### 现实生活中的 SjLj (Real World SjLj)

其实从上面的 🌰(例子) 中，可以联想到，是不是可以利用 SjLj 构建 C 中的 `try-catch block`？实际上已经有人为我们完成了这个工作。简单的来说使用宏定义一些东西即可完成这样的任务。我自己尝试做了一个简单的玩具

```C
#include <setjmp.h>
#include <stdio.h>

#define TRY      do { jmp_buf my_env__; int val = setjmp(my_env__); if (val == 0)
#define CATCH(X) else { int X = val;
#define THROW(X) longjmp(my_env__, X)
#define ENDTRY   } } while(0)

int main() {
    TRY {
        printf("In try block\n");
        THROW(42);
        printf("Cannot reach\n");
    } CATCH(e) {
        printf("Got Exception code: %d\n", e);
    }
    ENDTRY;

    return 0;
}
```

一个叫做 `CException` 的库就是利用了这个想法 [link](https://github.com/ThrowTheSwitch/CException/)

### 参考资料

[1] [setjmp.h -- Wikipedia](https://en.wikipedia.org/wiki/Setjmp.h)

[2] [CException](http://www.throwtheswitch.org/cexception)
