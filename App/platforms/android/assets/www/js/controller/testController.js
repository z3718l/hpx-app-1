//ionicApp.controller('testController', function ($scope, $rootScope, $state, FILE_URL) {
//    var curRotate = 0;

//    var canvasWidth = $(window).get(0).innerWidth;			//定义canvas宽高
//    var canvasHeight = $(window).get(0).innerHeight - 200;

//    var isMouseDown = false;			//检测按下鼠标动作
//    var lastLoc = { x: 0, y: 0 };		//上一次的坐标

//    var canvas = document.getElementById("canvas");		//获取canvas对象
//    var context = canvas.getContext("2d");			//取得图形上下文
//    var mosicIndex = 0;                 //当前灰度索引
//    var mosicLevel = 30;                //灰度的层级
//    var oldStartX = oldStartY = -1;

//    canvas.width = canvasWidth;			//定义canvas宽高
//    canvas.height = canvasHeight;

//    $scope.size = 10;


//    var pencil = $scope.pencil = {
//        thickness: 30,
//        color: 'rgba(0,0,0,0)'
//    };


//    //function initProgress() {
//    //    $scope.progressInfo = "保存中...";

//    //    $scope.progressStyle = {
//    //        "width": "2%"
//    //    };
//    //}

//    var image = new Image();
//    image.crossOrigin = '*';

//    $scope.takePhoto = function () {
//        $scope.$takePhoto(function (data) {
//            $scope.photoSrc = data;
//        });
//    }

//    function initImage() {
//        $scope.imgUrl = "http://hpx-file.oss-cn-hangzhou.aliyuncs.com/hpxpic/ct7hdsTEZ6HgKfLAQTjXXTleVhdcRth3pEWi1kiYXsQ17zu.jpg";
//        image.src = $scope.imgUrl + "?" + new Date().getTime();

//        image.onload = function () {
//            context.drawImage(image, 0, 0, canvasWidth, canvasHeight);		//绘制图像
//        }
//    }

//    initImage();


//    ////当鼠标在外部并且松开的时候
//    //$("body").addEventListener('touchend', function (e) {
//    //    isMouseDown = false;
//    //}, false);

//    // 手指按下
//    canvas.addEventListener('touchstart', function (e) {
//        e.preventDefault();
//        isMouseDown = true;

//        lastLoc = windowToCanvas(e.touches[0].pageX, e.touches[0].pageY);
//    }, false);

//    // 手指离开
//    canvas.addEventListener('touchend', function (e) {
//        e.preventDefault();
//        isMouseDown = false;
//    }, false);

//    // 手指移动
//    canvas.addEventListener('touchmove', function (e) {
//        e.preventDefault();
//        if (isMouseDown) {
//            var size = $scope.size;
//            var curLoc = windowToCanvas(e.touches[0].pageX, e.touches[0].pageY);
//            //var pixelData = context.getImageData(curLoc.x, curLoc.y, Math.abs(lastLoc.x-curLoc.x),Math.abs(lastLoc.y-curLoc.y));    // 获得区域数据
//            var r = g = b = 0;
//            var s = "";
//            var startX = startY = 0;

//            startX = parseInt(curLoc.x / size) * size;
//            startY = parseInt(curLoc.y / size) * size;
//            if (oldStartX != startX || oldStartY != startY) {
//                r = g = b = mosicIndex * mosicLevel + 80;
//                mosicIndex = (mosicIndex + 1) % 6;
//                s = 'rgb(' + r + ',' + g + ',' + b + ')';
//                context.fillStyle = s;
//                context.fillRect(startX, startY, size, size);
//                oldStartX = startX;
//                oldStartY = startY;
//            }

//            lastLoc = curLoc;
//        }
//    }, false);

//    //鼠标移动事件
//    canvas.onmousemove = function (e) {

//    };

//    function windowToCanvas(x, y) {				//计算canvas上面的坐标
//        var point = canvas.getBoundingClientRect();			//元素边框距离页面的距离
//        x = Math.round(x - point.left);
//        y = Math.round(y - point.top);
//        return { x: x, y: y };
//    }

//    //$scope.saveImage = function () {
//    //    $scope.save(0);
//    //};
//    //$scope.replaceImage = function () {
//    //    $scope.save(1);
//    //};
//    $scope.save = function () {
//        // 获取Base64编码后的图像数据，格式是字符串
//        // 后面的部分可以通过Base64解码器解码之后直接写入文件。
//        var data_url = canvas.toDataURL("image/png");
//        //var blob = dataURLtoBlob(data_url);
//        var fileName = getEndorsementFileName($scope.imgUrl);
//        //var fd = new FormData();
//        //fd.append("file", blob, fileName);
//        //var xhr = new XMLHttpRequest();
//        //xhr.addEventListener('load', onLoadHandler, false);
//        ////xhr.upload.addEventListener('progress', $scope.onProgressHandler, false);
//        //xhr.open('POST', FILE_URL + '/fileWithName', true);
//        //xhr.send(fd);


//        var uri = FILE_URL + '/fileWithName';
//        var options = new FileUploadOptions();

//        options.fileKey = "file";
//        options.fileName = getEndorsementFileName($scope.imgUrl);
//        options.mimeType = "image/jpeg";
//        //options.headers = { 'Authorization': 'Bearer ' + $rootScope.identity.token };
//        //options.params = { 'FileTypeCode': 1002 };

//        var ft = new FileTransfer();
//        ft.upload(data_url, uri, function (result) {
//            alert("上传成功！");
//        }, function (err) {
//            alert(err.exception);
//        }, options);
//    };

//    var onLoadHandler = function (event) {
//        if (this.status == 200 || this.status == 304) {
//            //var result = JSON.parse(this.responseText);
//            //alert("保存成功");
//        }
//    };

//    //$scope.onProgressHandler = function (event) {
//    //    if (event.lengthComputable) {
//    //        var percentComplete = parseInt(event.loaded / event.total * 100) + "%";
//    //        $scope.progressStyle.width = percentComplete;
//    //        if (event.loaded == event.total) {
//    //            console.log("保存成功");
//    //            $scope.progressInfo = "保存成功";
//    //            //保存成功后续处理
//    //            afterSave();
//    //        }
//    //        $scope.$apply();
//    //    }
//    //};

//    //function afterSave() {
//    //    $("#progressModal").modal('hide');
//    //    var data = {
//    //        bill: $stateParams.data.model
//    //    };
//    //    $state.go('app.constants.checkBill', { data: data });
//    //}

//    //$scope.resetCanvas = function () {
//    //    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
//    //}

//    function dataURLtoBlob(dataurl) {
//        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//        while (n--) {
//            u8arr[n] = bstr.charCodeAt(n);
//        }
//        return new Blob([u8arr], { type: mime });
//    }

//    ////获取文件名称
//    function getEndorsementFileName(imgUrl) {
//        var url = imgUrl.split("/");
//        var preNames = url[url.length - 1].split(".");
//        return preNames[0] + "-1." + preNames[1];
//    }

//    ////顺时针旋转
//    //$scope.clockwise = function () {
//    //    console.log(curRotate);
//    //    curRotate = curRotate + 1;
//    //    refreshImg();
//    //};

//    ////逆时针旋转
//    //$scope.eastern = function () {
//    //    console.log(curRotate);
//    //    curRotate = curRotate - 1;
//    //    refreshImg();
//    //};

//    //function refreshImg() {
//    //    context.save();
//    //    var rotation = curRotate * Math.PI / 2;
//    //    context.clearRect(0, 0, canvasWidth, canvasHeight)
//    //    context.translate(canvasWidth / 2, canvasHeight / 2);
//    //    context.rotate(rotation);
//    //    context.translate(-canvasWidth / 2, -canvasHeight / 2);
//    //    context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
//    //    context.restore();//恢复状态
//    //}
//})