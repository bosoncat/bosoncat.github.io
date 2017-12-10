---
title: ZYNQ7000 VDMA视频通路
date: 2017-10-20 23:02:47
tags:
---

​	emmm好像好久都没有更新博客了，这几天一直在调试这个视频通路，感觉很崩溃，各种奇怪的原因搞死了自己。总之，视频通路是调通了，之后的明天再说吧，这里简单记录下视频通路的搭建过程，以防以后自己再犯这些弱智的错误...
<!--more-->
#### 架构简介

​	本系统前端由OV7725的摄像头输入经过Video转AXI_StreamXilinx IP core)输入到VDMA(Video direct memory access)构成，视频的处理通过VDMA的s2mm(stream to memory map)通道输入到ZYNQ的HP(High performance)通道进行读取及处理，为了debug的方便，在VDMA的mm2s(memory map to stream)后置了AXI_Stream转Video后，通过RGB转HDMI接显示屏，大致视频通路长这个样子...
![overview0](./overview0.png)


#### 开发流程

​	因为这个视频通路是我第一次搭建，所以大约用了两周左右，踩了很多的坑(有时候心态都不好了...)，主要在几方面

* 搭建视频通路一定要有合适的顺序，比如我一开始纠结在到底从前端开始搭建还是从后方开始，后来反复尝试后，选择了先搭建显示部分(VDMA_mm2s-->video_out-->RGB-->HDMI)，搭建好后先显示一张静态图片检测时序
* 异域时钟的适配，这个我也是第一次弄异域时钟，为了方便把前端的时钟和后端显示的频率弄成了一致25MHz，所以比较方便，其他的问题准备慢慢改进
* 最重要的是：连接硬件一定要检测管脚！！！因为这个问题我搞坏了2个OV7725摄像头，第一个OV7725(3V3)被我插到了5V电源上，当时立马就糊了...然后就凉了...第二个被我正负极反接了...别问我为啥这么ZZ，我也不知道啊！！


### 简单介绍
该系统主要分为三个部分，分别是

* 视频输入前端：主要由OV7725Sensor，Video_in_axis(Xilinx IP core)，VDMA(Xilinx IP core)构成，主要工作流程如下，OV7725Sensor输入RGB信号，Video_in_axis将RGB信号转为AXI-Stream输入到VDMA模块，存储到DDR中。
* 视频处理和控制部分：主要由VDMA(Xilinx IP core)，ZYNQ-7000(Xilinx IP core)，AXI_mem_interconnect(Xilinx IP core)构成，VDMA模块将DDR中的数据通过AXI-Stream的形式，通过AXI-mem-interconnect高速经HP(High performance)端口ZYNQ的ARM硬核中进行处理，同时通过GP端口对整个系统模块进行调度。
* 视频输出后端：主要由VDMA(Xilinx IP core)，AXIS_Video_out(Xilinx IP core)，HDMI模块构成，主要承担数据输出的任务，VDMA从DDR中读取数据，通过AXIS_Video_out将AXI-Stream数据流转为RGB信号输入HDMI模块，转为DVI格式输出。

> 注：上述三部分之前采取异步时钟，目的是方便移植，以适应各种需求。视频出入前端部分时钟由视频传感器的工作时钟决定此处处理图像像素为640*480，时钟为25MHz，视频处理和控制部分主要是由数据传输速率决定，这里为100MHz，最大150MHz，视频输出后端由HDMI输出，所以由25MHz和125MHz(5×25MHz)时钟驱动

### 视频通路设计与介绍

> 下列各模块介绍均统一为如下格式：
>
> PORT(接口) | DIRECTION(接口数据/信号流向) | DESCRIPTION(接口描述)
>
> 为描述方便，略去一些未使用的信号端，读者有兴趣可以研究

#### 视频输入前端

> 视频通路前端由一个OV7725的摄像头构成，通过Video_in_axis的Xilinx IP核转为AXI-Stream输入VDMA模块做缓存。如Figure. 1所示。各模块连接细节如下，各总线均规范为AXI/AXIS形式的总线，故设计原理上清晰明了：

![overview1](./overview1.png)

* OV_Sensor_ML_0

![OVSensor](./OVSensor.png)

* Video In to AXI4-Stream

![VidIn](./VidIn.png)

| PORT             | DIRECTION | DESCRIPTION            |
| ---------------- | --------- | ---------------------- |
| vid_active_video | input     | 视频流输入有效信号              |
| vid_data[23:0]   | input     | 视频流数据输入                |
| vid_hsync        | input     | 视频流行同步信号               |
| vid_vsync        | input     | 视频流帧同步信号               |
| vid_io_in_clk    | input     | 视频io驱动时钟(本设计中为25MHz)   |
| vid_io_in_ce     | input     | 视频io使能信号               |
| vid_io_in_reset  | input     | 视频io复位信号               |
| aclk             | input     | AXI4-Stream总线驱动时钟      |
| aclk_en          | input     | AXI4-Stream总线驱动时钟使能    |
| aresetn          | input     | AXI4-Stream总线复位信号(低有效) |
| axis_enable      | input     | AXI4-Stream总线使能信号      |
| video_out        | output    | AXI4-Stream突发传输数据总线    |

* AXI Video Direct Memory Access

![VDMA](./VDMA.png)

| PORT                  | DIRECTION | DESCRIPTION                              |
| --------------------- | --------- | ---------------------------------------- |
| S_AXI_LITE            | input     | AXI_LITE控制总线                             |
| S_AXIS_S2MM           | input     | Stream to Memory Map数据输入总线               |
| s_axi_s2mm_tkeep[2:0] | input     | AXI内部信号参阅pg085(此处均置高)                    |
| m_axi_mm2s_aclk       | input     | AXI Memory Map to Stream总线驱动时钟(本设计中为100MHz) |
| m_axis_mm2s_aclk      | input     | AXIS Memory Map to Stream总线驱动时钟(本设计中为100MHz) |
| m_axi_s2mm_aclk       | input     | AXI Stream to Memory Map总线驱动时钟(本设计中为100MHz) |
| s_axis_s2mm_aclk      | input     | AXIS Stream to Memory Map总线驱动时钟(本设计中为100MHz) |
| axi_resetn            | input     | AXI总线复位信号(低有效)                           |
| M_AXI_MM2S            | output    | AXI Memory Map to Stream总线(通过MEM interconnect接ZYNQ HP端口) |
| M_AXI_S2MM            | output    | AXI Stream to Memory Map总线(通过MEM interconnect接ZYNQ HP端口) |
| M_AXIS_MM2S           | output    | AXIS Memory Map to Stream总线(接外置显示模块)     |
| mm2s_introut          | output    | Memory Map to Stream中断输出                 |
| s2mm_introut          | output    | Stream to Memory Map中断输出                 |

#### 视频处理和控制部分

> 这部分主要用来从DDR获取视频流数据，对数据进行处理(处理细节将在软件部分进行讲解，这里不做过多介绍，仅对数据流向做解释说明)，视频处理和控制部分主要由VDMA(Xilinx IP core)，ZYNQ-7000(Xilinx IP core)，AXI_mem_interconnect(Xilinx IP core)构成，主要详细说明ZYNQ-7000硬核的配置。

![overview2](./overview2.png)

* AXI Interconnect

![mem_intr](./mem_intr.png)

| PORT             | DIRECTION | DESCRIPTION                     |
| ---------------- | --------- | ------------------------------- |
| S00_AXI          | inout     | AXI Slave00总线(用作视频流写入)          |
| S01_AXI          | inout     | AXI Slave01总线(用作视频流读出)          |
| ACLK             | input     | AXI总线驱动时钟(本设计中为100MHz)          |
| ARESETN[0:0]     | input     | AXI总线复位信号(低有效)                  |
| S00_ACLK         | input     | AXI Slave00总线驱动时钟(本设计中为100MHz)  |
| S00_ARESETN[0:0] | input     | AXI Slave00总线复位信号(低有效)          |
| M00_ACLK         | input     | AXI Master00总线驱动时钟(本设计中为100MHz) |
| M00_ARESET[0:0]  | input     | AXI Master00总线复位信号(低有效)         |
| S01_ACLK         | inout     | AXI Slave01总线驱动时钟(本设计中为100MHz)  |
| S01_ARESETN[0:0] | inout     | AXI Slave01总线复位信号(低有效)          |
| M00_AXI          | inout     | AXI Master00总线                  |

* ZYNQ-7000 Processing System

| PORT           | DIRECTION | DESCRIPTION                     |
| -------------- | --------- | ------------------------------- |
| S_AXI_HP0      | inout     | 高性能AXI Slave总线                  |
| M_AXI_GP0_ALCK | input     | 通用AXI总线驱动时钟(本设计中为100MHz)        |
| S_AXI_HP0_ACLK | input     | 高性能AXI Slave总线驱动时钟(本设计中为100MHz) |
| IRQ_F2P        | input     | PL到PS终端请求                       |
| GPIO_0         | output    | EMIO扩展端口，本设计用作OV7725的IIC控制接口    |
| M_AXI_GP0      | output    | 通用AXI Master总线                  |
| FCLK_CLK0      | output    | PL驱动时钟(本设计中为100MHz)             |
| FCLK_RESET0_N  | output    | PL时钟复位信号(低有效)                   |

>  ZYNQ-7000 Processing System内部设置：
>
>  - MIO  48-49 --> UART1
>  - EMIO 54-55 --> GPIO(IIC)

![zynq](./zynq.png)

#### 视频输出后端

> 视频输出后端主要包含AXI4-Stream Subset Convertor(Xilinx IP core)，Video Timing Controller(Xilinx IP core)，AXI4-Stream Videos Out(Xilinx IP core)，HDMI，重要信号线连接如下图所示。

![overview3](./overview3.png)

* AXI4-Stream Subset Convertor

![subset](./subset.png)

| PORT    | DIRECTION | DESCRIPTION                 |
| ------- | --------- | --------------------------- |
| S_AXIS  | input     | AXI4-Stream Slave总线(宽度32位)  |
| aclk    | input     | AXI总线驱动时钟                   |
| aresetn | input     | AXI总线复位信号                   |
| M_AXIS  | output    | AXI4-Stream Master总线(宽度24位) |

* Video Timing Controller

![vtc](./vtc.png)

| PORT           | DIRECTION | DESCRIPTION                        |
| -------------- | --------- | ---------------------------------- |
| clk            | input     | 驱动时钟(需与视频流的pixel clk相同，本设计采用25MHz) |
| clken          | input     | 驱动时钟使能信号                           |
| gen_clken      | input     | 生成时钟使能信号                           |
| resetn         | input     | 复位信号                               |
| vtiming_out    | output    | 视频流输出驱动时钟(本设计采取像素为640*480的驱动时钟)    |
| fsync_out[0:0] | output    | ~~场同步信号~~(本设计未用到)                  |

* AXI4-Stream to Video Out

![vid_o](./vid_o.png)

| PORT             | DIRECTION | DESCRIPTION                              |
| ---------------- | --------- | ---------------------------------------- |
| video_in         | input     | AXI4-Stream视频流输入总线                       |
| vtiming_in       | input     | 包含输出视频的时序信息                              |
| aclk             | input     | AXI4-Stream总线驱动时钟                        |
| aclken           | input     | AXI4-Stream总线驱动时钟使能信号                    |
| aresetn          | input     | AXI4-Stream总线复位信号                        |
| fid              | input     | ~~frame id~~(本设计未用到)                     |
| vid_io_out_clk   | input     | Video io驱动时钟(本设计中为25MHz)                 |
| vid_io_out_ce    | input     | Video io使能信号                             |
| vid_io_out_reset | input     | Video io复位信号                             |
| vid_active_video | output    | active信号(个人理解为视频有效信号)                    |
| vid_data[23:0]   | output    | 视频流数据总线                                  |
| vid_sync         | output    | 视频同步信号                                   |
| vtg_ce           | output    | 用来控制gen_clken信号，这个设计十分巧妙，解决了异域时钟带来的时序问题(具体参考pg044)|

* HDMI

![HDMI](./HDMI.png)

#### 效果图

![display](./display.png)
