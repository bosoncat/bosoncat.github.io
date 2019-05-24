---
title: Links
---

<script defer src="https://use.fontawesome.com/releases/v5.0.13/js/all.js"></script>

Below are some awesome pages of my friends or good resources; Feel free to contact me if you want to exchange links with me :)

| Where?                                                     | What?                                  | Site Status             |
|:---------------------------------------------------------- |:-------------------------------------- |:----------------------- |
| [浅浅的博客](https://seujxh.wordpress.com/)                | 浅浅的博客                             | <span testURL="https://seujxh.wordpress.com/favicon.ico"> Testing </span> |
| [我的小米粥分你一半](https://corvo.myseu.cn/)              | FYH 的博客                             | <span testURL="https://corvo.myseu.cn/favicon.ico"> Testing </span>       |
| [Max Qi](https://cherishher.github.io/)                    | Max Qi 的博客                          | <span testURL="https://cherishher.github.io/img/favicon.ico"> Testing </span> |
| [ MHY ](https://www.96mhy.top/)                            | MHY 的博客                             | <span testURL="https://www.96mhy.top/wordpress/wp-content/uploads/2018/05/cropped-pexels-photo-262669-1-1024x239.jpeg"> Testing </span>|
| [Fancy's Blog](http://fanyc.myseu.cn/)                     | FYC 的博客                             | <span testURL="https://fanyc.myseu.cn/static/img/904784fb81452e695387da1453f9a696.png"> Testing </span> |
| [Citrix's Playground](https://citrixqian.top/)             | Citrix 的博客                          | <span testURL="https://citrixqian.top/favicon-16x16.png"> Testing </span> |
| [崔庆才的博客](https://cuiqingcai.com/)                    | 崔庆才的博客                           | <span testURL="https://cuiqingcai.com/wp-content/themes/Yusi/timthumb.php?src=https://qiniu.cuiqingcai.com/wp-content/uploads/2019/02/xxx-e1550711818507.jpeg&h=123&w=200&q=90&zc=1&ct=1"> Testing </span> |
| [Herald-Studio](https://myseu.cn/)                         | 小猴偷米的主页                         | <span testURL="https://cdn.myseu.cn/splash-640-1136.e2b2faf8.png"> Testing </span> |
| [侯吉旋老师的主页](http://blog.sciencenet.cn/u/jixuanhou/) | 很有趣的老师，有很多科普文             | <span testURL="https://image-attachment.oss-cn-beijing.aliyuncs.com/data/www/html/uc_server/data/avatar/000/08/45/19_avatar_middle.jpg"> Testing </span> |
| [Matt Might](http://matt.might.net/)                       | Lots of interesting topics on PL       | <span testURL="http://matt.might.net/pics/Matt-Might-White-House-2-Jan-2015-small.jpg"> Testing </span> |
| [Mike Bostock](https://bost.ocks.org/mike/)                | Founder of D3.js Blog                  | <span testURL="https://bost.ocks.org/mike/code.png"> Testing </span> |
| [MaskRay](http://maskray.me/blog/)                         | MaskRay 的博客                         | <span testURL="https://maskray.me/icon/github.svg"> Testing </span> |
| [LLVM Blog](http://blog.llvm.org/)                         | LLVM Blog                              | <span testURL="https://llvm.org/img/DragonSmall.png"> Testing </span> |

> Note: Sites' status is tested via loading random choosed images from those sites.

```javascript
// Code example for testing sites availability.
function testConnections() {
  let links = document.querySelectorAll("span[testURL]")

  for (let i = 0; i < links.length; i ++) {
    let u = links[i].getAttribute('testURL')

    let img = document.body.appendChild(document.createElement("img"));
    img.style.display = "none";
    img.onload = function() {
        links[i].innerHTML = '<i class="fas fa-circle" color="#00ff00"></i> Online'
    };

    img.onerror = function() {
        links[i].innerHTML = '<i class="fas fa-circle" color="#ff0000"></i> Offline'
    };

    img.src = u;
  }
}
```

<script>
function testConnections() {
  let links = document.querySelectorAll("span[testURL]")

  for (let i = 0; i < links.length; i ++) {
    let u = links[i].getAttribute('testURL')

    let img = document.body.appendChild(document.createElement("img"));
    img.style.display = "none";
    img.onload = function() {
        links[i].innerHTML = '<i class="fas fa-circle" color="#00ff00"></i> Online'
    };

    img.onerror = function() {
        links[i].innerHTML = '<i class="fas fa-circle" color="#ff0000"></i> Offline'
    };

    img.src = u;
  }
}

testConnections();
</script>
