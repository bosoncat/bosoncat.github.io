---
title: "进程同步的几个小问题"
date: 2018-10-19T15:51:05+08:00
---

### Introduction

国庆节看了一点点 go, 看到 go channel 比较眼熟，可以当做进程同步中的信号量 `(semaphore)`，毕竟 go 是本身支持并发的，所以拿他来做这部分作业还是很省事的，下面就简单的用它来模拟一下课本中几个经典的问题 (本文可能会一点一点的更新，也欢迎大家补充~)

### 生产者-消费者模型 (Producer–Consumer Problem)

因为写这个东西的时候我没有带课本... 所以信号量的命名都是按照 [Wikipedia](https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem) 上面来的，具体的可以自行转换。这里给出的是信号量解法，也就是利用最基本的 `PV 操作` 来完成。为了给出简单、直观的解法，我做了一点简化，比如：一些用来计数的信号量，我用 buffer 的大小来表示当前的计数值

#### 信号量定义
```go
type semaphore chan int    // 定义信号量类型为 chan int
const maxSize = 3          // 共享区的上限

var (
	emptyCount = make(semaphore, maxSize) // 空闲共享区的大小
	fullCount  = make(semaphore, maxSize) // 已使用的共享区大小
	useQueue   = make(semaphore, 1)       // mutex 只分配一个 byte 大小来表示 bool，满代表 true，空代表 false
	items      = make(semaphore, maxSize) // 生产者生产的产品
)
```

#### PV 操作
```go
// P 操作，消耗一个资源
func (sema *semaphore) P() {
	for {
		if len(*sema) > 0 {
			<- *sema
			break
		}
	}
}

// V 操作，释放一个资源
func (sema *semaphore) V() {
	for {
		if len(*sema) < cap(*sema) {
			*sema <- 1
			break
		}
	}
}
```

#### 生产者和消费者
```go
func producer() {
	for {
		emptyCount.P()  // 消耗一个空闲区空的信号
		useQueue.P()    // 上锁
		items.V()       // 释放一个产品
		fmt.Printf("[Producer] Produce 1. Now we have %v items.\n", len(items))
		useQueue.V()    // 开锁
		fullCount.V()   // 释放一个空闲区满的信号
	}
}

func consumer() {
	for {
		fullCount.P()  // 消耗空闲区满的信号
		useQueue.P()   // 上锁
		items.P()      // 消耗一个产品
		fmt.Printf("[Consumer] Consume 1. Now we have %v items.\n", len(items))
		useQueue.V()   // 开锁
		emptyCount.V() // 释放一个空闲区空的信号
	}
}
```

#### 初始化
```go
func init() {
	// 初始化空闲区空的信号
	for i := 0; i < maxSize; i ++ {
		emptyCount <- 1
	}
	// 初始化 mutex
	useQueue <- 1
}

func main() {
	// 然后 producer 和 consumer 分别跑在两个 goroutine 上
	go producer()
	go consumer()
	time.Sleep(time.Duration(5)*time.Millisecond)
	return
}
```

#### 打印结果
```sh
$ ./producer-consumer
[Producer] Produce 1. Now we have 1 items.
[Producer] Produce 1. Now we have 2 items.
[Consumer] Consume 1. Now we have 1 items.
[Consumer] Consume 1. Now we have 0 items.
[Producer] Produce 1. Now we have 1 items.
[Consumer] Consume 1. Now we have 0 items.
[Producer] Produce 1. Now we have 1 items.
[Producer] Produce 1. Now we have 2 items.
[Producer] Produce 1. Now we have 3 items.
```
