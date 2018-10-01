---
title: "LLVM Passes"
tags: ["LLVM"]
date: 2018-09-22T19:49:49+08:00
---

### Introduction

One of the most important parts of a compiler is the optimization system. In LLVM, these works are done by *LLVM Pass Framework*. LLVM Passes perform various transforms/optimizations over functions, modules and so on. Besides, owing to its perfect modular design, passes could be combined and scheduled to construct successful compilers, like GHC, Swift etc. If you are interested in the ideas behind the LLVM compiler infrastructure, I recommend you going through this article [LLVM - The Architecture of Open Source Applications](http://www.aosabook.org/en/llvm.html) by Chris Lattner. This article is my notes on *LLVM Passes Framework*, mostly are dumped from LLVM websites, see my footnotes.

### Overview

If you are familiar with LLVM IR, you will not surprised that LLVM Passes are divided into several different levels (*Module*, *Function*, *BasicBlock* and *Instruction*) to handle different types of optimizations or transforms. Usually, a single source file can be treated as a *Module*, which contained *Functions*. A *Function* can has *BasicBlocks*, which contains *Instructions*. These abstract structures (except *Module*), all are *Value* in LLVM. Besides, *Module*, *Function* and *BasicBlock* are iterable.

```cpp
llvm::Module::iterator      /* iterate to walk Functions inside Module */
llvm::Function::iterator    /* iterate to walk BasicBlocks inside Function */
llvm::BasicBlock::iterator  /* iterate to walk Instructions inside BasicBlock */

         *Hierarchy of LLVM-IR*
+------------------------------------------+
| Module                                   |
| +-------------+  +---------------------+ |
| | Global Vars |  | Function            | |
| +-------------+  | +-----------------+ | |
|                  | | BasicBlock      | | |
|                  | | +-------------+ | | |
|                  | | | Instruction | | | |
|                  | | +-------------+ | | |
|                  | +-----------------+ | |
|                  +---------------------+ |
+------------------------------------------+
```

### LLVM Passes

There are multiple Passes class, *ImmutablePass*, *ModulePass*, *CallGraphSCCPass*, *FunctionPass*, *LoopPass*, *RegionPass*, *BasicBlockPass* and *MachineFunctionPass*. They are all inherited from class *Pass*. So, LLVM Pass Framework will excute our Pass efficiently, depending on the class that our Pass derived from. I will not focus on all these class listed, only give some simple examples.

#### ImmutablePass

[*ImmutablePass*](http://llvm.org/doxygen/classllvm_1_1ImmutablePass.html) is a very special Pass. It provides information about target information, compiler configuration and so on. It just provides some useful information.

#### ModulePass

[*ModulePass*](http://llvm.org/doxygen/classllvm_1_1ModulePass.html) treats a single file as a unit. Usually, *ModulePass* can do some transforms or analyses on the highest level. This could give us a global view on our program.

e.g. Traverse a program and iterate over its *Modules*, *Functions*, *BasicBlocks*.

```cpp
struct SimpleModulePass : public ModulePass {
  static char ID;
  SimpleModulePass() : ModulePass(ID) {  }

  bool runOnModule(Module &M) override {
    errs() << "Enter Module: ";
    errs().write_escaped(M.getName()) << '\n';
    for (auto &F: M) {
      errs() << "Enter Function: ";
      errs().write_escaped(F.getName()) << '\n';
      for (auto &BB: F) {
        errs() << "Enter BasicBlock: ";
        errs().write_escaped(BB.getName()) << '\n';
        /* This will get nothing, because BasicBlock has no name by default */
        for (auto &I: BB) {
          errs() << "Instruction: ";
          errs() << I.getOpcodeName() << '\n';
        }
      }
    }
    return false; /* We only collect some information */
  }
};
```

#### CallGraphSCCPass

[*CallGraphSCCPass*](http://llvm.org/doxygen/classllvm_1_1CallGraphSCCPass.html) usually optimize a program by traversing the call graph bottom-up. We could use `opt -dot-callgraph` command to generate a call graph for whole program.

e.g. Generate a call graph for the codes below

```cpp
#include <iostream>
using namespace std;

int plusOne(int n) {
  return n+1;
}

int plusTwo(int n) {
  int n1 = plusOne(n);
  int n2 = plusOne(n1);
  return n2;
}

int main() {
  int n = 1;
  int m = plusTwo(n);
  int p = plusOne(n);
  printf("%d %d %d", n, m, p);
  return 0;
}
```

![callgraph](/archives/llvm-passes/callgraph.png)

Each nodes in a call graph represents a function call, and the edges represents a function call (from its begining to its ending). *SCC* means "Strongly Connected Component" (See: [Wikipedia](https://en.wikipedia.org/wiki/Strongly_connected_component)). 

e.g. Simple *CallGraphSCCPass* that dumps call graph info

```cpp
struct SimpleCallGraphSCCPass: public CallGraphSCCPass {
  static char ID;
  SimpleCallGraphSCCPass(): CallGraphSCCPass(ID) {  }

  bool runOnSCC(CallGraphSCC &SCC) override {
    errs() << " --- Enter Call Graph SCC ---\n";
    for (auto &G : SCC) {
      G->dump();
    }
    return false;
    errs() << " --- end of CallGraphSCC ---\n";
  }
};
```

Execite this Pass will get

```sh
 --- Enter Call Graph SCC ---
Call graph node for function: '_Z7plusOnei'<<0x7fdf04c04160>>  #uses=4

 --- Enter Call Graph SCC ---
Call graph node for function: '_Z7plusTwoi'<<0x7fdf04c041e0>>  #uses=2
  CS<0x7fdf04d05790> calls function '_Z7plusOnei'
  CS<0x7fdf04d05fa0> calls function '_Z7plusOnei'

 --- Enter Call Graph SCC ---
Call graph node <<null function>><<0x7fdf04c04100>>  #uses=1

 --- Enter Call Graph SCC ---
Call graph node for function: 'printf'<<0x7fdf04c043a0>>  #uses=2
  CS<0x0> calls external node

 --- Enter Call Graph SCC ---
Call graph node for function: 'main'<<0x7fdf04c042c0>>  #uses=1
  CS<0x7fdf04d06ce0> calls function '_Z7plusTwoi'
  CS<0x7fdf04d06e30> calls function '_Z7plusOnei'
  CS<0x7fdf04d07088> calls function 'printf'

 --- Enter Call Graph SCC ---
Call graph node <<null function>><<0x7fdf04c040d0>>  #uses=0
  CS<0x0> calls function '_Z7plusOnei'
  CS<0x0> calls function '_Z7plusTwoi'
  CS<0x0> calls function 'main'
  CS<0x0> calls function 'printf'
```

#### FunctionPass

[*FunctionPass*](http://llvm.org/doxygen/classllvm_1_1FunctionPass.html) optimized one function at a time. There are two constraints that you might choose *FunctionPass*:

* Optimizations are organized globally, i.e., a function at a time
* Optimizing a function that does not cause addition or removal of any functions in the module.

e.g. Count the number of operators in a program.

```cpp
struct OpsCounter : public FunctionPass {
  static char ID;
  std::map<std::string, int> opCounter;
  OpsCounter(): FunctionPass(ID) {  }

  bool runOnFunction(Function &F) override {
    for (auto &BB : F) {
      for (auto &I : BB) {
        auto opcode_it = opCounter.find(I.getOpcodeName());
        if (opcode_it != opCounter.end())
          // find one
          ++ opCounter[I.getOpcodeName()];
        else
          opCounter[I.getOpcodeName()] = 1;
      }
    }
    errs() << "opcode" << '\t' << "count" << '\n';
    for (auto &op : opCounter)
      errs() << op.first << '\t' << op.second << '\n';
    return false;
  }
};
```

#### BasicBlockPass

[*BasicBlockPass*](http://llvm.org/doxygen/classllvm_1_1BasicBlockPass.html) is used to implement local optimizations. It will visit each basic block in each function. LLVM Doc gives 3 constraints that if our codes meet, we should use it.

* Optimizations are local, operating on either a basic block or instruction at a time.
* Optimizations do not modify the CFG of the contained function, or any other basic block in the function.
* Optimizations conform to all of the constraints of FunctionPasses.

The basic usage of *BasicBlockPass* is pretty like *FunctionPass*, but focusing on different level. So, RTFM ; p

#### LoopPass

[*LoopPass*](http://llvm.org/doxygen/classllvm_1_1LoopPass.html) works on each loop inside functions. All *LoopPasses* are independ from each other, and when multiple loops are nested, the outer most loop is excuted last. To implement this Pass, we need to overwrite *runOnLoop* method.

#### RegionPass

[*RegionPass*](http://llvm.org/doxygen/classllvm_1_1RegionPass.html) visit the basic blocks that not in loops in each function. This Pass is not so widely used, so I will not give a simple demo on this Pass.

#### MachineFunctionPass

[*MachineFunctionPass*](http://llvm.org/doxygen/classllvm_1_1MachineFunctionPass.html) is a machine dependent Pass. This Pass is a part of code generator in LLVM framework. Hence, this Pass cannot be run using *opt* command.

### Conclusion

This post only gives an overview on LLVM Passes, and gives some simple& easy examples. For some details, I would like to talk about them in series articles. If you find any mistakes or anything makes you uncomfortable, please contact me :)

### Further Reading

* [LLVM - The Architecture of Open Source Applications](http://www.aosabook.org/en/llvm.html) -- Chris Lattner
* [Writing an LLVM Pass](http://llvm.org/docs/WritingAnLLVMPass.html) -- LLVM Docs
* [Writing an LLVM Pass](http://laure.gonnord.org/pro/research/ER03_2015/lab3_intro.pdf) -- Department of Computer Science - Universidade Federal de Minas Gerais
* [LLVM for Grad Students](http://www.cs.cornell.edu/~asampson/blog/llvm.html) -- Adrian Sampson
* [LLVM-and-Polly-Tutorial](http://www.grosser.es/publications/grosser-2012--LLVM-and-Polly-Tutorial--Indian-Institute-of-Science.pdf) -- Though a Polly related slides, it still introducing lots of background knowledges
