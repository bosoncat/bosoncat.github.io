---
title: "进程同步的几个小问题"
date: 2018-10-19T15:51:05+08:00
---

### Introduction

国庆节看了一点点 go, 看到 go channel 比较眼熟，可以当做进程同步中的信号量 `(semaphore)`，毕竟 go 是本身支持并发的，所以拿他来做这部分作业还是很省事的，下面就简单的用它来模拟一下课本中几个经典的问题 (本文可能会一点一点的更新，也欢迎大家补充~)，所有代码可以在 [Github](https://github.com/Higuoxing/blog-source/tree/master/process-sync) 找到

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
			<- *sema    // 消耗一个资源
			break
		}
		runtime.Gosched()   // 把控制权移出
	}
}

// V 操作，释放一个资源
func (sema *semaphore) V() {
	for {
		if len(*sema) < cap(*sema) {
			*sema <- 1  // 释放一个资源
			break
		}
		runtime.Gosched()   // 把控制权移出
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
...
```

### 哲学家进餐问题 (Dining Philosophers Problem)
关于问题描述可以参照操作系统的书籍或者 [Wikipedia](https://en.wikipedia.org/wiki/Dining_philosophers_problem)，关于更详细的解析可以看[这里](https://pages.mtu.edu/~shene/NSF-3/e-Book/MUTEX/TM-example-philos-1.html)，这里我们采取只有哲学家两边的筷子都可用时才允许他进餐的策略

#### 信号量定义
```go
var (
	chopstics = make([]semaphore, 5)  // 哲学家们的筷子
	mutex   = make(semaphore, 1)      // 互斥锁
)

```

#### 进餐
```go
func dining(i int) {
	for {
		mutex.P()                 // 上锁
		chopstics[i].P()          // 取筷子
		chopstics[(i+1)%5].P()
		mutex.V()                 // 开锁
		fmt.Printf("Philosopher %v is eating\n", i+1)
		chopstics[i].V()          // 释放筷子
		chopstics[(i+1)%5].V()
		fmt.Printf("Philosopher %v is thinking\n", i+1) // 思考
	}
}
```

#### 初始化
```
func init() {
	for i := 0; i < 5; i ++ {
		chopstics[i] = make(semaphore, 1)
		chopstics[i].V()          // 释放筷子
	}
	mutex.V()                         // 释放互斥锁
}

func main() {
	for i := 0; i < 5; i ++ {
		go dining(i)
	}
	time.Sleep(time.Duration(5) * time.Millisecond)
	return
}
```

#### 打印结果
```sh
$ ./dining-philosophers
Philosopher 4 is eating
Philosopher 4 is thinking
Philosopher 2 is eating
Philosopher 2 is thinking
Philosopher 2 is eating
Philosopher 2 is thinking
Philosopher 5 is eating
Philosopher 5 is thinking
...
```

### 吸烟者问题 (Cigarette-Smoker problem)
也是课本上的几个小问题之一，问题描述与解决方案可以参考[这里](http://www.cs.umd.edu/~hollings/cs412/s96/synch/smokers.html)

#### 信号量定义

```go
var (
	smoker_match = make(semaphore, 1)   // 烟草和纸的信号量
	smoker_paper = make(semaphore, 1)   // 火柴和烟草的信号量
	smoker_tobacco = make(semaphore, 1) // 火柴和纸的信号量
	smoking_done = make(semaphore, 1)   // 吸完烟的信号量
)
```

#### 供应者和吸烟者进程

```go
func provider() {
	for {
		random := rand.Intn(3)
		switch (random) {
		case 0:
			smoker_match.V()    // 唤醒拥有火柴的吸烟者进程
		case 1:
			smoker_paper.V()    // 唤醒拥有卷烟纸的吸烟者进程
		case 2:
			smoker_tobacco.V()  // 唤醒拥有烟草的吸烟者进程
		}
		smoking_done.P()            // 等待吸烟者吸完继续发放材料					
	}
}

// 拥有火柴的吸烟者进程，其余类似不予赘述
func smoker_0() {
	for {
		smoker_match.P()
		fmt.Println("Smoker who has match is smoking")
		smoking_done.V()
	}
}
```

#### 初始化变量

```go
func init() {
	smoking_done.V()

}

func main() {
	go provider()
	go smoker_0()
	go smoker_1()
	go smoker_2()
	time.Sleep(time.Duration(5) * time.Millisecond)
	return
}
```

#### 打印结果

```sh
$ ./cigarette-smoker
Smoker who has tobacco is smoking
Smoker who has tobacco is smoking
Smoker who has paper is smoking
Smoker who has match is smoking
Smoker who has match is smoking
...
```

### Conclusion

以上的代码均以好玩，简单为目的。Go 真的很有趣，可以像上面那样用类似伪码的形式把进程同步的小问题解决掉，我很喜欢。具体 `goroutine` 以及 `go channel` 的用法和原理可以到 [golang.org](https://golang.org) 参考。
