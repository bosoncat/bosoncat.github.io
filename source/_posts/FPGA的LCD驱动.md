---
title: FPGA的LCD驱动
date: 2017-09-13 23:00:03
tags:
---

最近手痒痒，就在X宝淘了一块7寸LCD屏幕和一个摄像头模块，呃...由于之前做过FPGA驱动VGA之类的实验，所以LCD的时序也不难写，几乎是和VGA是一致的，并且这个RGB888比之前RGB565的好太多
<!--more-->
简单测试后，定位了屏幕显示的格点，就想用一张静态图片来进行测试，嘿嘿，从百度拿了一张800*480的小姐姐图片![test800_480.jpg][2]

简单的用python处理成coe文件后发现了个愚蠢的问题...FPGA板上的BRAM资源不够啊...果然自己的无脑操作行不通，最后只把RGB中R通道写到了coe文件中，无所谓了，反正只是为了测试显示而已。![Screenshot from 2017-09-12 12-04-56.png][1]



可以看出来即使是一个通道FPGA的BRAM资源就占了70%！

![D32EC85C1FBCF97BABABB833123B4B0C.jpg][3]

唉，寸土寸金啊，小姐姐还是下次待我写道SD卡中读取吧...未完待续

先附上我的驱动代码部分吧...

```verilog
`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Company:
// Engineer: Eric 2017.09.12
//////////////////////////////////////////////////////////////////////////////////


module LCD_module(
    input wire clk_33M,
    input wire rst_n,
    output wire lcd_dclk,
    output wire lcd_hsync,
    output wire lcd_vsync,
    output wire lcd_de,
    output wire lcd_rst,    // -- Active high
    output wire [10:0] lcd_hsync_cnt,
    output wire [9:0] lcd_vsync_cnt
    );

    // -- Herizontal Parameters
    parameter LinePeriod =1056;
    parameter H_SyncPulse=128;
    parameter H_BackPorch=88;
    parameter H_ActivePix=800;
    parameter H_FrontPorch=40;
    parameter Hde_start=216;
    parameter Hde_end=1016;

    // -- Vertical Parameters
    parameter FramePeriod =505;
    parameter V_SyncPulse=3;
    parameter V_BackPorch=21;
    parameter V_ActivePix=480;
    parameter V_FrontPorch=1;
    parameter Vde_start=24;
    parameter Vde_end=504;

    reg [10:0] hsync_cnt;
    reg [9:0]  vsync_cnt;
    reg [7:0] lcd_r_reg;
    reg [7:0] lcd_g_reg;
    reg [7:0] lcd_b_reg;

    reg hsync_r;
    reg vsync_r;
    reg hsync_de;
    reg vsync_de;

    assign lcd_dclk = ~ clk_33M;
    assign lcd_hsync = hsync_r;
    assign lcd_vsync = vsync_r;
    assign lcd_de = hsync_de && vsync_de;

    always @ (posedge clk_33M) begin
        if (!rst_n) hsync_cnt <= 1'b1;
        else if (hsync_cnt == LinePeriod) hsync_cnt <= 1'b1;
        else hsync_cnt <= hsync_cnt + 1;
    end

    always @ (posedge clk_33M) begin
        if (!rst_n) hsync_r <= 1'b1;
        else if (hsync_cnt == 1) hsync_r <= 1'b0;
        else if (hsync_cnt == H_SyncPulse) hsync_r <= 1'b1;
        else hsync_r <= hsync_r;

        if (!rst_n) hsync_de <= 1'b0;
        else if (hsync_cnt == Hde_start) hsync_de <= 1'b1;
        else if (hsync_cnt == Hde_end) hsync_de <= 1'b0;
        else hsync_de <= hsync_de;
    end

    always @ (posedge clk_33M) begin
        if (!rst_n) vsync_cnt <= 1'b1;
        else if (vsync_cnt == FramePeriod) vsync_cnt <= 1'b1;
        else if (hsync_cnt == LinePeriod) vsync_cnt <= vsync_cnt + 1;
        else vsync_cnt <= vsync_cnt;
    end

    always @ (posedge clk_33M) begin
        if (!rst_n) vsync_r <= 1'b1;
        else if (vsync_cnt == 1) vsync_r <= 1'b0;
        else if (vsync_cnt == V_SyncPulse) vsync_r <= 1'b1;
        else vsync_r <= vsync_r;

        if (!rst_n) vsync_de <= 1'b0;
        else if (vsync_cnt == Vde_start) vsync_de <= 1'b1;
        else if (vsync_cnt == Vde_end) vsync_de <= 1'b0;
        else vsync_de <= vsync_de;
    end

    assign lcd_rst = 1'b1;

    assign lcd_hsync_cnt = (Hde_start) ? (hsync_cnt - 217) : 11'd0;
    assign lcd_vsync_cnt = (Vde_start) ? (vsync_cnt - 25)  : 10'd0;

endmodule


```

[2]: ./597094276.jpg
[3]: ./3989588488.jpg

