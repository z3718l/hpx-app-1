ionicApp.controller('calculatorController', function ($rootScope, $scope, $state, $ionicPopup, toolService, $ionicModal) {
    $scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;
        $scope.changeMode(index - 1);
    }
    //计算时用的数字的栈
    $scope.num = [];
    //接受输入用的运算符栈
    $scope.opt = [];
    //计算器计算结果
    $scope.result = '';
    //表示是否要重新开始显示,为true表示不重新显示，false表示要清空当前输出重新显示数字
    $scope.flag = true;
    //表示当前是否可以再输入运算符，如果可以为true，否则为false
    $scope.isOpt = true;
    //显示计算器样式
    var date = new Date();
    //alert(date);
    //date.setHours(date.getHours() + 8);
    //alert(date);
    //date.setDate(date.getDate() - 1);
    //alert(date);
    var tormorrow = new Date();
    //alert(tormorrow);
    tormorrow.setDate(date.getDate() + 1);
    //alert(tormorrow);
    $scope.model = {
        /*
        start_date: date,
        start_time: date.toISOString().slice(0, 10),/*toLocaleDateString().replace('/','-').replace('/','-')
        end_date: tormorrow,
        end_time: tormorrow.toISOString().slice(0, 10),/*toLocaleDateString().replace('/', '-').replace('/', '-'),*/
        interest_type: "year",
        bill_type: "elec",
        adjust_day: 0,
        days: "",
    };


    //alert($scope.model.start_date);
    //alert($scope.model.start_time);
    //alert($scope.model.end_date);
    //alert($scope.model.end_time);
    $scope.initModel = {};
    angular.copy($scope.model, $scope.initModel);
    /*
    $scope.model.start_date = date,
    $scope.model.start_time = date.toISOString().slice(0, 10);/*toLocaleDateString().replace('/','-').replace('/','-')
    $scope.model.end_date = tormorrow;
    $scope.model.end_time = tormorrow.toISOString().slice(0, 10);/*toLocaleDateString().replace('/', '-').replace('/', '-'),*/
    $scope.chooseMany = 0;
    $scope.interestTypes = [{ type: 'year', name: '年利率' }, { type: 'month', name: '月利率' }];
    $scope.billTypes = [{ type: 'elec', name: '电票' }, { type: 'paper', name: '纸票' }];
    $scope.changeType = function (type) {
        if ($scope.chooseMany == 0) {
            switch (type) {
                case "year":
                    $scope.model.interest_type = 'year'; $scope.model.bill_type = 'elec'; $scope.model.adjust_day = 0;
                    break;
                case "month":
                    $scope.model.interest_type = 'month'; $scope.model.bill_type = 'paper'; $scope.model.adjust_day = 3;
                    break;
                case "elec":
                    $scope.model.bill_type = 'elec'; $scope.model.adjust_day = 0; $scope.model.interest_type = 'year';
                    break;
                case "paper":
                    $scope.model.bill_type = 'paper'; $scope.model.adjust_day = 3; $scope.model.interest_type = 'month';
                    break;
            }
        }
        else {
            switch (type) {
                case "elec":
                    $scope.model.bill_type = 'elec'; $scope.model.interest_type = 'year'; $scope.model.adjust_day = 0;
                    break;
                case "paper":
                    $scope.model.bill_type = 'paper'; $scope.model.interest_type = 'month'; $scope.model.adjust_day = 3;
                    break;
                case "year":
                    $scope.model.interest_type = 'year'; $scope.model.bill_type = 'elec';
                    break;
                case "month":
                    $scope.model.interest_type = 'month'; $scope.model.bill_type = 'paper';
                    break;
            }
        }
    }

    $scope.$watch('model.start_date', function (newValue, oldValue) {
        /*
            toISOString().slice(0, 10)会减一天;
            实际上start-time比start-date少一天
        */
        if (newValue != null) newValue.setDate(newValue.getDate() + 1);
        if (newValue === oldValue) { return; } // AKA first run
        //if ($scope.model.start_time instanceof Date) {
        /*
        var dateValue = new Date();
        dateValue.setHours(newValue.getHours() + 8);
        dateValue.setDate(dateValue.getDate() - 1);
        */
        if (newValue == null) $scope.model.start_time = null;
        else {
            /*
            $scope.model.start_time = newValue/*.toISOString().slice(0, 10);//toLocaleDateString().replace('/', '-').replace('/', '-');
            alert($scope.model.start_time);*/
            $scope.model.start_time = newValue.toISOString().slice(0, 10);//toLocaleDateString().replace('/', '-').replace('/', '-');
            //alert($scope.model.start_time);
        }
        $scope.onTimeSet($scope.model.start_time, 'start_time');
        //}
    });
    $scope.$watch('model.end_date', function (newValue, oldValue) {
        if (newValue != null) newValue.setDate(newValue.getDate() + 1);
        if (newValue === oldValue) { return; } // AKA first run
        if (newValue == null) $scope.model.end_time = null;
        else $scope.model.end_time = newValue.toISOString().slice(0, 10);;//toLocaleDateString().replace('/', '-').replace('/', '-');
        $scope.onTimeSet($scope.model.end_time, 'end_time');
    });
    $scope.$watch('model.many_start_date', function (newValue, oldValue) {
        if (newValue != null) newValue.setDate(newValue.getDate() + 1);
        if (newValue === oldValue) { return; } // AKA first run
        if (newValue == null) $scope.model.many_start_time = null;
        else {
            /*
            $scope.model.many_start_time = newValue/*.toISOString().slice(0, 10); //toLocaleDateString().replace('/', '-').replace('/', '-');
            alert($scope.model.many_start_time);
            */
            $scope.model.many_start_time = newValue.toISOString().slice(0, 10);
            //alert($scope.model.many_start_time);
        }
        $scope.onTimeSet($scope.model.many_start_time, 'many_start_time');
    });
    $scope.$watch('model.many_end_date', function (newValue, oldValue) {
        if (newValue != null) newValue.setDate(newValue.getDate() + 1);
        if (newValue === oldValue) { return; } // AKA first run
        if (newValue == null) $scope.model.many_end_time = null;
        else $scope.model.many_end_time = newValue.toISOString().slice(0, 10); //toLocaleDateString().replace('/', '-').replace('/', '-');
        $scope.onTimeSet($scope.model.many_end_time, 'many_end_time');
    });

    //选择时间，请求是否假期
    $scope.onTimeSet = function (newDate, key) {
        if (newDate == null) {
            $scope.model[key + '_tip'] = '';
            return;
        }
        toolService.isCalendarSpecial(newDate).then(function (data) {
            $scope.model[key + '_tip'] = data.holiday_name;
        });
    }
    /*
    //手机端<input type=date 对ng-change无响应,导致即时判断是否为节假日暂时无法实现。。
    $scope.changeTime = function (time, key) {
        alert("changeTime");
        alert(time);
        var date = new Date(time);
        alert(date);
        date = date.toISOString();
        alert(date);
        date = date.toISOString().slice(0, 10);
        alert(date);
        switch (key) {
            case "start_time":
                $scope.model.start_time = date;
                break;
            case "end_time":
                $scope.model.end_time = date;
                break;
            case "many_start_time":
                $scope.model.many_start_time = date;
                break;
            case "many_end_time":
                $scope.model.many_end_time = date;
                break;
        }
    }
    */
    $scope.calcuInterest = function (func) {
        var query = {};
        angular.copy($scope.model, query);
        if (!$scope.model.denomination) {
            $ionicPopup.alert({
                title: '提示',
                template: '请输入票面金额！',
                okText: '确    定',
                cssClass: 'hpxModal'
            });
            return;
        }
        //通过利率计算
        if (!func) {
            if (!$scope.model.interest) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入利率！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }

            if (!$scope.model.start_time || !$scope.model.end_time) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入开始和结束时间！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }
            if (parseInt($scope.model.start_time.replace(/-/g, "")) >= parseInt($scope.model.end_time.replace(/-/g, ""))) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '贴现时间必须小于到期时间！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }
            if ($scope.model.interest) {
                query['interest_year'] = null;
                query['interest_month'] = null;
                query['interest_' + $scope.model.interest_type] = query.interest;
            }
        } else {
            //十万计算
            if (!$scope.model.every_plus) {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入贴息！',
                    okText: '确    定',
                    cssClass: 'hpxModal'
                });
                return;
            }
            query.start_time = null;
            query.end_time = null;
            if ($scope.model.many_start_time && $scope.model.many_end_time) {
                if (parseInt($scope.model.many_start_time.replace(/-/g, "")) >= parseInt($scope.model.many_end_time.replace(/-/g, ""))) {

                    $ionicPopup.alert({
                        title: '提示',
                        template: '贴现时间必须小于到期时间！',
                        okText: '确    定',
                        cssClass: 'hpxModal'
                    });
                    return;
                }
                query.start_time = $scope.model.many_start_time;
                query.end_time = $scope.model.many_end_time;
            }
            else {
                toolService.calculator(query, func).then(function (data) {
                    $scope.interestResult = {
                        discount_interest: data.discount_interest,
                        discount_amount: data.discount_amount
                    }

                });
                return;
            }
        }

        toolService.calculator(query, func).then(function (data) {
            $scope.interestResult = data;
        });
    }

    //重置表单
    $scope.clear = function () {
        angular.copy($scope.initModel, $scope.model);
        $scope.interestResult = "";
    }

    $scope.changeMode = function (mode) {
        $scope.chooseMany = mode;
        $scope.clear();
    }

    //再计算
    $scope.calculatorAgain = function (func) {
        if (!func) {
            $scope.model.interest = Number($scope.interestResult['interest_' + $scope.model.interest_type]);
            $scope.model.start_date = $scope.model.many_start_date;
            $scope.model.start_time = $scope.model.many_start_time;
            $scope.model.end_date = $scope.model.many_end_date;
            $scope.model.end_time = $scope.model.many_end_time;
            /*
            $scope.model = {
                denomination: $scope.model.denomination,
                interest_type: $scope.model.interest_type,
                bill_type: $scope.model.bill_type,
                every_plus: $scope.model.every_plus,
                commission: $scope.model.commission,
            };
            */
            $scope.tab = 1;
            $scope.chooseMany = 0;
        }
        else {
            $scope.model.every_plus = Number($scope.interestResult.every_plus_amount),
            $scope.model.many_start_date = $scope.model.start_date;
            $scope.model.many_start_time = $scope.model.start_time;
            $scope.model.many_end_date = $scope.model.end_date;
            $scope.model.many_end_time = $scope.model.end_time;
            /*
            $scope.model = {
                denomination: $scope.model.denomination,
                interest_type: $scope.model.interest_type,
                bill_type: $scope.model.bill_type,
            };
            */
            $scope.tab = 2;
            $scope.chooseMany = 1;
        }
        $scope.calcuInterest(func);
    }

    //计算器弹框
    $ionicModal.fromTemplateUrl('calc.html', {
        scope: $scope,
        //animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.calcModal = modal;
        $scope.calcHeight = $(window).get(0).innerHeight + 6;
        console.log($scope.calcHeight)
    });

    $scope.openCalcModal = function (number) {
        if (number) {
            $scope.calcModal.show();
            $scope.number = number;
            $scope.result = $scope.number;
            $scope.num.push($scope.number);
        }
    }

    $scope.closeCalcModal = function () {
        $scope.calcModal.hide();
    }
    $scope.data = {
        "1": ["AC", "+/-", "%", "÷"],
        "2": ["7", "8", "9", "×"],
        "3": ["4", "5", "6", "－"],
        "4": ["1", "2", "3", "＋"],
        "5": ["返回","0", ".", "="]
    };
  
    $scope.showClass = function (index, a) {
        if (a == 0) {
            return "zero";
        }
        return index == 3 || a == "=" ? "end-no" : "normal";
    };
    $scope.init=function(){
        $scope.num = [];
        
        $scope.opt=[];
        $scope.flag = true;
        $scope.isOpt = true;
        $scope.point = false;

    };
    $scope.showResult = function (a) {
        var reg = /\d/ig, regDot = /\./ig, regAbs = /\//ig;
        //如果点击的是个数字
        if (reg.test(a)) {
            //消除冻结
            if ($scope.isOpt == false) {
                $scope.isOpt = true;
            }
            if ($scope.result != 0 && $scope.flag && $scope.result != "error") {
                $scope.result += a;
            }
            else if ($scope.point == true && $scope.flag && $scope.result != 'error') {
                $scope.result += a;
                $scope.point = false;
            }
            else {
                $scope.result = a;
                $scope.flag = true;
            }
        }
            //如果点击的是AC
        else if (a == "AC") {
            $scope.result = '';
            $scope.result += 0;
            $scope.init();
        }
        else if (a == ".") {
            if ($scope.result != "" && $scope.flag && !regDot.test($scope.result)) {
                $scope.result += a;
                $scope.point = true;
            }
            else if($scope.result != '' && !$scope.flag) {
                $scope.result = '';
                $scope.result += 0;
                $scope.result += a;
                $scope.point = true;
                $scope.flag = true;
            }
        }
        else if (regAbs.test(a)) {
            if ($scope.result > 0) {
                $scope.result = "-" + $scope.result;
            }
            else {
                $scope.result = Math.abs($scope.result);
            }
        }
        else if (a == "%") {
            $scope.result = $scope.format(Number($scope.result) / 100);

        } else if (a == "返回") {
            $scope.closeCalcModal();
        }
            //如果点击的是个运算符且当前显示结果不为空和error
        else if ($scope.checkOperator(a) && $scope.result != "" && $scope.result != "error" && $scope.isOpt) {
            $scope.flag = false;
            $scope.num.push($scope.result);
            $scope.operation(a);
            //点击一次运算符之后需要将再次点击运算符的情况忽略掉
            $scope.isOpt = false;
        }
        else if (a == "=" && $scope.result != "" && $scope.result != "error") {
            $scope.flag = false;
            $scope.num.push($scope.result);
            while ($scope.opt.length != 0) {
                var operator = $scope.opt.pop();
                var right = $scope.num.pop();
                var left = $scope.num.pop();
                $scope.calculate(left, operator, right);
            }
        }
    };
    $scope.format = function (num) {
        //var regNum = /.{10,}/ig;
        //if (regNum.test(num)) {
        //    if (/\./.test(num)) {
        //        return num.toExponential(3);
        //    }
        //    else {
        //        return num.toExponential();
        //    }
        //}
        //else {
        //    return num;
        //}
        return num;
    }
    //比较当前输入的运算符和运算符栈栈顶运算符的优先级
    //如果栈顶运算符优先级小，则将当前运算符进栈，并且不计算，
    //否则栈顶运算符出栈，且数字栈连续出栈两个元素，进行计算
    //然后将当前运算符进栈。
    $scope.operation = function (current) {
        //如果运算符栈为空，直接将当前运算符入栈
        if (!$scope.opt.length) {
            $scope.opt.push(current);
            return;
        }
        var operator, right, left;
        var lastOpt = $scope.opt[$scope.opt.length - 1];
        //如果当前运算符优先级大于last运算符，仅进栈
        if ($scope.isPri(current, lastOpt)) {
            $scope.opt.push(current);
        }
        else {
            operator = $scope.opt.pop();
            right = $scope.num.pop();
            left = $scope.num.pop();
            $scope.calculate(left, operator, right);
            $scope.operation(current);
        }
    };
    //负责计算结果函数
    $scope.calculate = function (left, operator, right) {
        switch (operator) {
            case "＋":
                $scope.result = $scope.format(Number(left) + Number(right));
                $scope.num.push($scope.result);
                break;
            case "－":
                $scope.result = $scope.format(Number(left) - Number(right));
                $scope.num.push($scope.result);
                break;
            case "×":
                $scope.result = $scope.format(Number(left) * Number(right));
                $scope.num.push($scope.result);
                break;
            case "÷":
                if (right == 0) {
                    $scope.result = "error";
                    $scope.init();
                }
                else {
                    $scope.result = $scope.format(Number(left) / Number(right));
                    $scope.num.push($scope.result);
                }
                break;
            default: break;
        }
    };
    //判断当前运算符是否优先级高于last，如果是返回true
    //否则返回false
    $scope.isPri = function (current, last) {
        if (current == last) {
            return false;
        }
        else {
            if (current == "×" || current == "÷") {
                if (last == "×" || last == "÷") {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        }
    };
    //判断当前符号是否是可运算符号
    $scope.checkOperator = function (opt) {
        if (opt == "＋" || opt == "－" || opt == "×" || opt == "÷") {
            return true;
        }
        return false;
    }
    $scope.denominationChange = function () {
        //alert("??")
        if ($scope.model.denomination < 0) {
            $scope.model.denomination = 0;
            return;
        }
        //var changed = false;
        //if ($scope.model.denomination > 10) {
        //    alert("jhjh")
        //    changed = true;
        //}
        //console.log(($scope.model.denomination + '').split('.'))
        //var denomination = ($scope.model.denomination + '').split('.')
        ////alert(denomination[0].length)
        //var changed = false;
        //if (denomination[0].length > 6) {
        //    denomination[0] = '';
        //    changed = true;
        //}
        //if (denomination[1] && denomination[1].length > 6) {
        //    denomination[1] = '';
        //    changed = true;
        //}
        //if (changed) {
        //    denomination = denomination.join('.');
        //    $scope.model.denomination = parseFloat(denomination);
        //}
        if ($scope.model.denomination > 999999.999999) {
            $scope.model.denomination = 999999.999999;
        }
        
        //else 
        if ($scope.model.denomination < 0)$scope.model.denomination = 0;
    }
    //if ($scope.tab == 2) {
    //    $scope.denominationChange = function () {
    //        if ($scope.model.denomination < 0) {
    //            $scope.model.denomination = 0;
    //            return;
    //        }
    //        if ($scope.model.denomination > 999999.999999) {
    //            $scope.model.denomination = 999999.999999;
    //        }
    //        if ($scope.model.denomination < 0) $scope.model.denomination = 0;
    //    }
    //}

    // date字体大小的调整
    var o = document.getElementById('appDate1');
});