# video-speed（倍数播放）
调节网页H5视频播放速率的chrome扩展程序，最高可达50倍播放速率  
## 安装依赖
```sh
 cd ./video-speed
 npm install
```

## 构建扩展程序
```sh
 npm run build
 ```
 执行上面的命令后生成扩展程序目录`dist`
 ## 安装扩展到浏览器
在浏览器中点击 `菜单->扩展程序`或直接地址栏输入 `chrome://extensions/`转到扩展程序管理面板，点击启用`开发者模式`，然后点击`加载已解压的扩展程序`选择`dist`目录即可
