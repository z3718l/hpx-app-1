ionicApp.controller('smearBillController', function ($rootScope, $ionicPopup, $scope, $state, localStorageService, FILE_URL, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer) {
    var curRotate = 0;

    var outSize = $(window).get(0).innerWidth * 2;			//定义canvas宽高
    $('#cv').height = outSize;

    var isMouseDown = false;			//检测按下鼠标动作
    var lastLoc = { x: 0, y: 0 };		//上一次的坐标

    var canvas = document.getElementById("canvas");		//获取canvas对象
    var context = canvas.getContext("2d");			//取得图形上下文
    var mosicIndex = 0;                 //当前灰度索引
    var mosicLevel = 30;                //灰度的层级
    var oldStartX = oldStartY = -1;
    var history = [];                   // 历史记录

    canvas.width = outSize;			//定义canvas宽高
    canvas.height = outSize;
    //context.fillStyle = 'rgba(255, 255, 255, 0)';

    var hasPhoto = false;

    var shareImgUrl = null;//分享图片链接

    $scope.setting = {
        size: 10
    };


    var pencil = $scope.pencil = {
        thickness: 30,
        color: 'rgba(0,0,0,0)'
    };


    //function initProgress() {
    //    $scope.progressInfo = "保存中...";

    //    $scope.progressStyle = {
    //        "width": "2%"
    //    };
    //}

    var image = new Image();
    image.crossOrigin = '*';

    drawImage = function () {
        if (image.height > image.width) {
            canvas.height = outSize;
            canvas.width = canvas.height * image.width / image.height;
        } else {
            canvas.width = outSize;
            canvas.height = canvas.width * image.height / image.width;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);		//绘制图像

        //$('#cv').height = outSize;
    }

    $scope.initImage = function () {
        $scope.$takePhoto(function (data) {
            $scope.photoSrc = data;

            $scope.imgUrl = $scope.photoSrc;
            image.src = $scope.imgUrl + "?" + new Date().getTime();

            hasPhoto = true;

            image.onload = function () {
                drawImage();
            }
        });
    }



    $scope.cancel = function () {
        if (history.length > 0) {
            var pixelData = history.pop();
            context.putImageData(pixelData, 0, 0);
        }

        //image.src = $scope.imgUrl + "?" + new Date().getTime();

        //image.onload = function () {
        //    drawImage();
        //}
    }
    ////当鼠标在外部并且松开的时候
    //$("body").addEventListener('touchend', function (e) {
    //    isMouseDown = false;
    //}, false);

    // 手指按下
    canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        isMouseDown = true;

        lastLoc = windowToCanvas(e.touches[0].pageX * 2, e.touches[0].pageY * 2);

        var pixelData = context.getImageData(0, 0, canvas.width, canvas.height);
        history.push(pixelData);
    }, false);

    // 手指离开
    canvas.addEventListener('touchend', function (e) {
        e.preventDefault();
        isMouseDown = false;
    }, false);

    // 手指移动
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (isMouseDown && hasPhoto) {
            var size = $scope.setting.size;
            var curLoc = windowToCanvas(e.touches[0].pageX * 2, e.touches[0].pageY * 2);
            //var pixelData = context.getImageData(curLoc.x, curLoc.y, Math.abs(lastLoc.x-curLoc.x),Math.abs(lastLoc.y-curLoc.y));    // 获得区域数据
            var r = g = b = 0;
            var s = "";
            var startX = startY = 0;

            startX = parseInt(curLoc.x / size) * size;
            startY = parseInt(curLoc.y / size) * size;
            if (oldStartX != startX || oldStartY != startY) {
                r = g = b = mosicIndex * mosicLevel + 80;
                mosicIndex = (mosicIndex + 1) % 6;
                s = 'rgb(' + r + ',' + g + ',' + b + ')';
                context.fillStyle = s;
                context.fillRect(startX, startY, size, size);
                oldStartX = startX;
                oldStartY = startY;
            }
            shareImgUrl = null;
            lastLoc = curLoc;
        }
    }, false);

    //鼠标移动事件
    canvas.onmousemove = function (e) {

    };

    function windowToCanvas(x, y) {				//计算canvas上面的坐标
        var point = canvas.getBoundingClientRect();			//元素边框距离页面的距离
        x = Math.round(x - point.left);
        y = Math.round(y - point.top);
        return { x: x, y: y };
    }

    //$scope.saveImage = function () {
    //    $scope.save(0);
    //};
    //$scope.replaceImage = function () {
    //    $scope.save(1);
    //};
    $scope.save = function () {
        try {
            window.canvas2ImagePlugin.saveImageDataToLibrary(function (msg) {
                $ionicPopup.alert({
                    title: "提示",
                    template: "保存成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
            },
                function (err) {
                    $ionicPopup.alert({
                        title: "提示",
                        template: "保存失败！" + err,
                        okText: '确    定',
                        cssClass: 'hpxModal',
                    });
                }, document.getElementById('canvas')
            );
        } catch (e) {
            //alert(e.message);
        }
    };

    var onLoadHandler = function (event) {
        if (this.status == 200 || this.status == 304) {
            //var result = JSON.parse(this.responseText);
            //alert("保存成功");
        }
    };

    //$scope.onProgressHandler = function (event) {
    //    if (event.lengthComputable) {
    //        var percentComplete = parseInt(event.loaded / event.total * 100) + "%";
    //        $scope.progressStyle.width = percentComplete;
    //        if (event.loaded == event.total) {
    //            console.log("保存成功");
    //            $scope.progressInfo = "保存成功";
    //            //保存成功后续处理
    //            afterSave();
    //        }
    //        $scope.$apply();
    //    }
    //};

    //function afterSave() {
    //    $("#progressModal").modal('hide');
    //    var data = {
    //        bill: $stateParams.data.model
    //    };
    //    $state.go('app.constants.checkBill', { data: data });
    //}

    //$scope.resetCanvas = function () {
    //    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    //}

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    ////获取文件名称
    function getEndorsementFileName(imgUrl) {
        var url = imgUrl.split("/");
        var preNames = url[url.length - 1].split(".");
        return preNames[0] + "-1." + preNames[1];
    }

    //顺时针旋转
    $scope.rotate = function () {
        curRotate = curRotate + 1;
        refreshImg();
    };

    ////逆时针旋转
    //$scope.eastern = function () {
    //    console.log(curRotate);
    //    curRotate = curRotate - 1;
    //    refreshImg();
    //};

    function refreshImg() {
        var w = canvas.width;
        var h = canvas.height;
        canvas.width = h;
        canvas.height = w;

        context.save();
        var rotation = curRotate * Math.PI / 2;
        context.clearRect(0, 0, canvas.width, canvas.height)

        if (curRotate % 2 == 0) {
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(rotation);
            context.translate(-canvas.width / 2, -canvas.height / 2);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
        } else {
            context.translate(canvas.width / 2, canvas.height / 2);
            context.rotate(rotation);
            context.translate(-canvas.height / 2, -canvas.width / 2);
            context.drawImage(image, 0, 0, canvas.height, canvas.width);
        }

        context.restore();//恢复状态
        shareImgUrl = null;
    }

    $scope.uploadShareImg = function () {
        try {
            var imgulr = canvas.toDataURL("image/png");
            //alert("调用uploadShareImg方法")
            var uri = 'http://139.224.112.243:4005/v1' + '/file';
            var options = new FileUploadOptions();

            options.fileKey = "file";
            options.fileNam = "0";
            options.mimeType = "image/png";
            //options.headers = { 'Authorization': 'Bearer ' + $rootScope.identity.token };
            options.params = { 'FileTypeCode': 1002 };

            var ft = new FileTransfer();
            ft.upload(imgulr, uri, function (result) {
                data = JSON.parse(result.response)
                //alert(JSON.stringify(result.response))
                //alert(data.data.file_path);
                shareImgUrl = data.data.file_path;
            }, function (err) {
                //alert(err.exception);
            }, options);
        } catch (e) {
            //alert(e.message)
        }
    }

    $scope.share = function () {
        $(".g-alert-shares").fadeIn(300);
        if (!shareImgUrl) {
            $scope.uploadShareImg();
        }
        var myPopup = $ionicPopup.show({
            cssClass: 'hpxShare',
            template: '<div class="g-alert-shares">' +
                      '<div class="box">' +
                      '<ul class="con">' +
                      '<li><a href="javascript:;" ng-click="shareToWechatFriend()"><img src="images/share1.png" alt=""/>微信好友</a></li>' +
                      '<li><a href="javascript:;" ng-click="shareToWechat()"><img src="images/share2.png" alt=""/>微信朋友圈</a></li>' +
                      //'<li><a href="javascript:;" ng-click="shareToWeibo()"><img src="images/share3.png" alt=""/>新浪微博</a></li>' +
                      '<li><a href="javascript:;" ng-click="shareToQQ()"><img src="images/share4.png" alt=""/>QQ好友</a></li>' +
                      '<li><a href="javascript:;" ng-click="shareToQQZone()"><img src="images/share5.png" alt=""/>QQ空间</a></li>' +
                      '</ul>' +
                      '</div>' +
                      '</div>',
            scope: $scope,
            buttons: [
                  {
                      text: '取消',
                  },
            ]
        })
    }

    $scope.shareToWechatFriend = function () {
        try {
            Wechat.share({
                message: {
                    title: '汇票分享',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    //thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    thumb: canvas.toDataURL("image/png"),
                    media: {
                        type: Wechat.Type.IMAGE,
                        image: canvas.toDataURL("image/png")
                    }
                },
                scene: Wechat.Scene.SESSION   // share to Timeline
            }, function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
            }, function (reason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: reason,
                //    okType: "button-assertive",
                //});
            });
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToWechat = function () {
        try {
            Wechat.share({
                message: {
                    title: '汇票分享',
                    description: '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！',
                    //thumb: "https://www.huipiaoxian.com/thumbnail.png",
                    thumb: canvas.toDataURL("image/png"),
                    media: {
                        type: Wechat.Type.IMAGE,
                        image: canvas.toDataURL("image/png")
                    }
                },
                scene: Wechat.Scene.TIMELINE   // share to Timeline
            }, function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
            }, function (reason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: reason,
                //    okType: "button-assertive",
                //});
            });
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToWeibo = function () {
        try {
            var args = {};
            //args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = '汇票分享',
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = canvas.toDataURL("image/png");
            WeiboSDK.shareToWeibo(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: failReason,
                //    okType: "button-assertive",
                //});
            }, args);
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToQQ = function () {
        //alert(shareImgUrl)
        try {
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            //args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = '汇票分享';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = shareImgUrl;
            QQSDK.shareImage(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: failReason,
                //    okType: "button-assertive",
                //});
            }, args);
        }
        catch (e) {
            alert(e.message);
        }
    };

    $scope.shareToQQZone = function () {
        try {
            var args = {};
            args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
            args.scene = QQSDK.Scene.QQZone;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
            //args.url = WEB_URL + '/share/index.html#/share/shareOffer?id=' + $scope.model.id.toString();
            args.title = '汇票分享';
            args.description = '汇票线，票据在线交易一站式服务平台，更安全、便捷、省钱！';
            args.image = shareImgUrl;
            QQSDK.shareImage(function () {
                $ionicPopup.alert({
                    title: "提示",
                    template: "分享成功！",
                    okText: '确    定',
                    cssClass: 'hpxModal',
                });
            }, function (failReason) {
                //$ionicPopup.alert({
                //    title: "提示",
                //    template: failReason,
                //    okType: "button-assertive",
                //});
            }, args);
        }
        catch (e) {
            alert(e.message);
        }
    };
});
