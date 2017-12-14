---
title: '[小猴偷米第六次技术分享]关于BT下载'
date: 2017-12-08 23:06:35
tags:
---

主要简单介绍了BT协议中的BEP0003和BEP0005，准备匆忙，没有在理论的基础上模拟DHT网络中的Node，有空填坑
<!--more-->

​	相信大家对种子、磁力链接并不陌生。像“老司机求种、好人一生平安”也成了时下的流行语。利用P2P(Peer-to-peer)网络下载、传输文件的流行开始于上世纪90年代，比较著名的软件有Napster和eDonkey2000(ed2k)，后来eDonkey公司因为版权问题倒闭，但是留下了ed2k协议，才有了后来的eMule(电骡)等等。[BT协议](http://www.bittorrent.org/beps/bep_0000.html)也是一种P2P文件分享的协议，是一个协议簇。据统计2004年12月互联网约有35%的流量来自于BT下载软件…

### BT协议

​	最初，BT协议由美国人**Bram Cohen**于2001年提出，同年做出了BitTorrent这一款软件，最初也是用`Python`，为解决提供下载服务器带宽不足而提出的一种解决方法。当时下载文件还只是简单的HTTP/FTP下载，服务器会经常由于下载人数过多而宕掉。最初的BT协议是这样讲的：

### 原理

​	发布者会根据分享的资源制作一个`.torrent`文件(所有字符串都是`UTF-8`编码，文件结构经过`Bencode`编码)，里面包含了分享资源的基本信息。

![Torrentcomp_small](./Torrentcomp_small.gif)

> B-encode:
>
> 整数：i数字e i42e
>
> 字符串：长度:内容 10:BitTorrent
>
> 序列：l内容e l12:HeraldStudioi2017ee
>
> 字典：d内容e d6:Herald6:Studio3:SEUi2017ee

下面我们来看看`.torrent`文件的组织(Archlinux 的种子)

```bash
$ cat archlinux-2017.12.01-x86_64.iso.torrent
d {
	8:announce42:http://tracker.archlinux.org:6969/announce
	7:comment41:Arch Linux 2017.12.01 (www.archlinux.org)
	10:created by13:mktorrent 1.1
	13:creation datei1512144157e
	4:info
	d {
		6:lengthi541065216e
		4:name31:archlinux-2017.12.01-x86_64.iso
		12:piece lengthi524288e
		6:pieces20640:'我是乱码- -(SHA-1 hash)'
	} e
	8:url-list l[
		52:http://mirrors.evowise.com/archlinux/iso/2017.12.01/
		53:http://mirror.rackspace.com/archlinux/iso/2017.12.01/
	]e
}e
```

```json
{
  "announce': "http://tracker.archlinux.org:6969/announce",
  "comment': "Arch Linux 2017.12.01 (www.archlinux.org)",
  "created by": "mktorrent 1.1",
  "creation date": 1512144157,
  "info": {
  	"length": 541065216,
    "name': "archlinux-2017.12.01-x86_64.iso",
    "piece length": 524288,
    "pieces": Buffer([0xaa, 0xbb, 0xcc, ...]) // 为了表示哈希值只能这样了...
  }
}
```

但是，这样还不够纯粹的去中心化思想，在2009年，比较著名的Tracker服务器提供者[海盗湾](https://thepiratebay.org)宣布，永久关停Traker服务器，后面海盗湾就只提供磁力链接了。后来衍生出了**DHT**网络[BEP005](http://www.bittorrent.org/beps/bep_0005.html)(BitTorrent Enhancement Proposal)

### 关于DHT网络

​	DHT协议主要根据一个叫做Kademlia的算法构建。本质上是每个结点都同时是一个Tracker服务器和和客户端。



![DHTNetWork](./DHTNetWork.png)

​	每台处于网络中的计算机都是一个独立的结点(Node)，他们有各自独立的NodeID(160bits sha1-hash)，同时维护着一张哈希表，上面记载着其他的所认识的结点(Peers)的信息，这是DHT网络的基本构成。那么它是怎么运作的呢？

### DHT原理

每个在DHT网络中的结点都有一个独立的长度为160bits的NodeID

结点之间的距离由XOR计算

| a    | b    | XOR(a, b) |
| ---- | ---- | --------- |
| 0    | 0    | 0         |
| 0    | 1    | 1         |
| 1    | 0    | 1         |
| 1    | 1    | 0         |

每个结点维护着一张路由表(Routing Table)，上面记录了所熟悉的结点信息

| NodeID                                   | ip              | port |
| ---------------------------------------- | --------------- | ---- |
| a0 3e 9d 96 9b ec f7 b7 5e 0c 15 e2 c3 3c 11 71 eb ac a8 36 | 233.233.233.233 | 6881 |

当有新的结点加入网络，需要向已知的在线结点请求，结点在路由表中加入新结点的信息。

当有结点下线，需要剔除掉（每个周期中对路由表中的所有结点进行ping请求）

结点间通信规则[BEP0005](http://www.bittorrent.org/beps/bep_0005.html)如下（所有包都经过Bencode编码）：

* ping:

  一般检验结点是否在线

```json
ping Query = {
	"t": "aa", 
	"y": "q", 
	"q": "ping", 
	"a": {
		"id": "abcdefghij0123456789"
		}
	}

bencoded = d1:ad2:id20:abcdefghij0123456789e1:q4:ping1:t2:aa1:y1:qe

Response = {
	"t": "aa", 
	"y": "r", 
	"r": {
		"id": "mnopqrstuvwxyz123456"
		}
	}

bencoded = d1:rd2:id20:mnopqrstuvwxyz123456e1:t2:aa1:y1:re
```

* find_node:

  寻找结点

```json
find_node Query = {
	"t": "aa", 
	"y": "q", 
	"q": "find_node", 
	"a": {
		"id": "abcdefghij0123456789", 
		"target": "mnopqrstuvwxyz123456"
		}
	}

bencoded = d1:ad2:id20:abcdefghij01234567896:target20:mnopqrstuvwxyz123456e1:q9:find_node1:t2:aa1:y1:qe

Response = {
	"t": "aa", 
	"y": "r", 
	"r": {
		"id": "0123456789abcdefghij", 
		"nodes": "def456..."
		}
	}

bencoded = d1:rd2:id20:0123456789abcdefghij5:nodes9:def456...e1:t2:aa1:y1:re
```

* get_peers:

  找种

```json
get_peers Query = {
	"t": "aa", 
	"y": "q", 
	"q": "get_peers", 
	"a": {
		"id": "abcdefghij0123456789", 
		"info_hash": "mnopqrstuvwxyz123456"
		}
	}
bencoded = d1:ad2:id20:abcdefghij01234567899:info_hash20:mnopqrstuvwxyz123456e1:q9:get_peers1:t2:aa1:y1:qe

Response with peers = {
	"t": "aa", 
	"y": "r", 
	"r": {
		"id": "abcdefghij0123456789", 
		"token": "aoeusnth", 
		"values": [
			"axje.u", "idhtnm"
			]
		}
	}

bencoded = d1:rd2:id20:abcdefghij01234567895:token8:aoeusnth6:valuesl6:axje.u6:idhtnmee1:t2:aa1:y1:re

Response with closest nodes = {
	"t": "aa", 
	"y": "r", 
	"r": {
		"id": "abcdefghij0123456789", 
		"token": "aoeusnth", 
		"nodes": "def456..."
		}
	}

bencoded = d1:rd2:id20:abcdefghij01234567895:nodes9:def456...5:token8:aoeusnthe1:t2:aa1:y1:re
```

* announce_peer:

  我这里有种！

```json
announce_peers Query = {
	"t": "aa", 
	"y": "q", 
	"q": "announce_peer", 
	"a": {
		"id": "abcdefghij0123456789", 
		"implied_port": 1, 
		"info_hash": "mnopqrstuvwxyz123456", 
		"port": 6881, 
		"token": "aoeusnth"
		}
	}

bencoded = d1:ad2:id20:abcdefghij01234567899:info_hash20:mnopqrstuvwxyz1234564:porti6881e5:token8:aoeusnthe1:q13:announce_peer1:t2:aa1:y1:qe
Response = {
	"t": "aa", 
	"y": "r", 
	"r": {
		"id": "mnopqrstuvwxyz123456"
		}
	}

bencoded = d1:rd2:id20:mnopqrstuvwxyz123456e1:t2:aa1:y1:re
```

​	打个比方，整个DHT网络就是东南大学，我们每个人是这个网络上的结点(Node)，我们的学号就是(Node ID)，某一天，小明看到了一个23系3班的女生（知道了人家的学号），想找到人家要电话号码。可是不认识人家啊！于是小明就在自己的朋友圈里发了一条信息，所有23系的同学帮我留意一下学号为23xxxxxx的同学，于是有的23系的同学们就根据学号的相似程度来一轮一轮的筛选，但是有的23系的同学只知道从你这里获得妹子的联系方式，但从来不会帮你打听，所以你就拉黑了他们（恶意结点），最后要到了这个妹子的联系方式，最后再一轮一轮的扩散消息，于是所有人都知道了这个妹子的联系方式...

### 新的分享套路

* 最近发现的好玩网站：P站
* 最近听的音乐：网易云每日推荐（废话
* 最近在学：node...
* 最近的，辣眼睛的主题：
![winxp_theme](./winxp_desktop.png)

### 参考资料

* [BEP0003](http://www.bittorrent.org/beps/bep_0003.html)
* [BEP0005](http://www.bittorrent.org/beps/bep_0005.html)
