ionicApp.controller('calendarController', function ($rootScope, $scope, $state, toolService) {
    $scope.tab = 1;
    $scope.setTab = function (index) {
        $scope.tab = index;

    }
    $scope.tab1 = 1;
    $scope.setTab1 = function (index) {
        $scope.tab1 = index;

    }
    var date = new Date();
    $scope.model = {
        billTypeId: 101,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        number: 6,
    }
    $scope.initModel = {};
    s = $scope.model.year;
    if ($scope.model.month < 10)
        s = s + '-0' + $scope.model.month;
    else
        s = s + '-' + $scope.model.month;
    if ($scope.model.day < 10)
        s = s + '-0' + $scope.model.day;
    else
        s = s + '-' + $scope.model.day;
    //$scope.todayStr = $scope.model.year + '-' + $scope.model.month + '-' + $scope.model.day;
    $scope.todayStr = s;    //当前日期字符串
    angular.copy($scope.model, $scope.initModel);

    $scope.getNumber = function (num) { var x = new Array(); for (var i = 0; i < num; i++) { x.push(i + 1); } return x; }
    //初始化数据,设置最大查询允许月份
    $scope.maxMonth = 2;
    function init_data() {
        $scope.allYears = new Array(20);
        $scope.allYears[0] = (date.getMonth() + 1) > 10 ? date.getFullYear() + 1 : date.getFullYear();
        for (var i = 1; i < $scope.allYears.length; i++)
            $scope.allYears[i] = $scope.allYears[i - 1] - 1;
        $scope.allMonths = $scope.getNumber((date.getMonth() + 1) > (12 - $scope.maxMonth) ? $scope.model.year > date.getFullYear() ? (date.getMonth() + 1 + $scope.maxMonth) % 12 : 12 : date.getMonth() + 1 + $scope.maxMonth);
        $scope.weekMap_en = {
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6,
            "Sunday": 7,
        };
        $scope.weekMap = {
            "星期一": 1,
            "星期二": 2,
            "星期三": 3,
            "星期四": 4,
            "星期五": 5,
            "星期六": 6,
            "星期日": 7,
        };
    }
    init_data();

    //reset
    $scope.reset = function () {
        $scope.model.day = $scope.initModel.day;
        $scope.setYear($scope.initModel.year);
        $scope.setMonth($scope.initModel.month);
        $scope.queryCalendar();
    }
    $scope.setYear = function (year) {
        if (date.getFullYear() <= year) {
            $scope.allMonths = $scope.getNumber((date.getMonth() + 1) > (12 - $scope.maxMonth) ? year > date.getFullYear() ? (date.getMonth() + 1 + $scope.maxMonth) % 12 : 12 : date.getMonth() + 1 + $scope.maxMonth);
        } else {
            $scope.allMonths = $scope.getNumber(12);
        }
        //判断不超过最大月份
        if ($scope.allMonths[$scope.allMonths.length - 1] < $scope.model.month) {
            $scope.model.month = $scope.allMonths[$scope.allMonths.length - 1];
        }
        $scope.model.year = year;
        $scope.queryCalendar();
    }
    $scope.setMonth = function (month) {
        if ($scope.allMonths[$scope.allMonths.length - 1] < month) {
            return;
        }
        $scope.model.month = month;
        $scope.queryCalendar();
    }

    //查询Calendar
    $scope.queryCalendar = function () {
        toolService.searchCalendar($scope.model.year, $scope.model.month, $scope.model.billTypeId, $scope.model.number).then(function (data) {
            $scope.calendarResult = new Array(5);
            var firstDayIndex = $scope.weekMap[data[0].week_name] - 1;
            var calendarPrev = new Array();
            for (var i = 0; i < firstDayIndex; i++)
                calendarPrev.push({ "week_name": null, "bill_calendar_days": null })
            for (var i = 0; i < 6; i++) {
                if (i == 0)
                    $scope.calendarResult[i] = calendarPrev.concat(data.slice(0, 7 - firstDayIndex))
                else
                    $scope.calendarResult[i] = data.slice(i * 7 - firstDayIndex, i * 7 + 7 - firstDayIndex);
                if ($scope.calendarResult[i].length != 7) {
                    for (var j = 0; j < 7 - $scope.calendarResult[i].length; j++)
                        $scope.calendarResult[i].push({ "week_name": null, "bill_calendar_days": null });
                }
            }
        });
    }
    $scope.queryCalendar();

    $scope.refresh = function (id) {
        $scope.model.billTypeId = id;
        if (id = 102)
            $scope.model.number = 6;
        $scope.queryCalendar();
    }

    $scope.refreshCycle = function (cycle) {
        $scope.model.number = cycle;
        $scope.queryCalendar();
    }
});
