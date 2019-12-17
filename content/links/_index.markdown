---
title: Links
---

Below are some awesome pages of my friends or good resources; Feel free to contact me if you want to exchange links with me :)

| Where?                                                     | What?                                  | Site Status             |
|:---------------------------------------------------------- |:-------------------------------------- |:----------------------- |
| [浅浅的博客](https://seujxh.wordpress.com/)                | 浅浅的博客                             | <span testURL="https://seujxh.wordpress.com/favicon.ico"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [Shadow 的博客](https://drunkdream.com/)                | Shadow 的博客                             | <span testURL="https://www.drunkdream.com/images/logo.gif"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [我的小米粥分你一半](https://corvo.myseu.cn/)              | FYH 的博客                             | <span testURL="https://corvo.myseu.cn/favicon.ico"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span>       |
| [Max Qi](https://cherishher.github.io/)                    | Max Qi 的博客                          | <span testURL="https://cherishher.github.io/img/favicon.ico"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [ MHY ](https://www.96mhy.top/)                            | MHY 的博客                             | <span testURL="https://www.96mhy.top/image/1.jpg"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span>|
| [tr1ple](https://www.cnblogs.com/wfzWebSecuity/) | Tr1ple 的博客 | <span testURL="https://www.cnblogs.com/favicon.ico"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [Fancy's Blog](https://fanyc.myseu.cn/)                     | FYC 的博客                             | <span testURL="https://fanyc.myseu.cn/static/img/904784fb81452e695387da1453f9a696.png"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [Zhi-ang's Blog](https://zhi-ang.github.io/)                     | Zhi-ang 的博客                             | <span testURL="https://zhi-ang.github.io/images/avatar.jpg"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [Citrix's Playground](https://citrixqian.top/)             | Citrix 的博客                          | <span testURL="https://citrixqian.top/favicon-16x16.png"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [崔庆才的博客](https://cuiqingcai.com/)                    | 崔庆才的博客                           | <span testURL="https://cuiqingcai.com/wp-content/themes/Yusi/timthumb.php?src=https://qiniu.cuiqingcai.com/wp-content/uploads/2019/02/xxx-e1550711818507.jpeg&h=123&w=200&q=90&zc=1&ct=1"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [Herald-Studio](https://myseu.cn/)                         | 小猴偷米的主页                         | <span testURL="https://cdn.myseu.cn/splash-640-1136.e2b2faf8.png"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [物含妙理总堪寻](https://blog.sciencenet.cn/u/jixuanhou) | 很有趣的老师，有很多科普文             | <span testURL="https://image-attachment.oss-cn-beijing.aliyuncs.com/data/www/html/uc_server/data/avatar/000/08/45/19_avatar_middle.jpg"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [Matt Might](http://matt.might.net/)                       | Lots of interesting topics on PL       | <span testURL="https://matt.might.net/pics/Matt-Might-White-House-2-Jan-2015-small.jpg"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [Mike Bostock](https://bost.ocks.org/mike/)                | Founder of D3.js Blog                  | <span testURL="https://bost.ocks.org/mike/code.png"> <img src="/img/circle-solid-yellow.svg"> Testing </span> |
| [MaskRay](https://maskray.me/blog/)                         | MaskRay 的博客                         | <span testURL="https://maskray.me/icon/github.svg"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [云风的博客](https://blog.codingnow.com/)                   | 云风的博客                             | <span testURL="https://blog.codingnow.com/favicon.ico"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |
| [LLVM Blog](https://blog.llvm.org/)                         | LLVM Blog                              | <span testURL="https://llvm.org/img/DragonSmall.png"> <img src="/img/circle-solid-yellow.svg"> Testing connection </span> |

### Note: Sites' status is tested via loading random choosed images from those sites.

<script>
function testConnections() {
  let links = document.querySelectorAll("span[testURL]")

  for (let i = 0; i < links.length; i ++) {
    let u = links[i].getAttribute('testURL')

    let img = document.body.appendChild(document.createElement("img"));
    img.style.display = "none";
    img.onload = function() {
        links[i].innerHTML = '<img src="/img/circle-solid-green.svg"> Secure connection'
    };

    img.onerror = function() {
        links[i].innerHTML = '<img src="/img/circle-solid-red.svg"> Offline or insecure connection'
    };

    img.src = u;
  }
}

testConnections();
</script>
