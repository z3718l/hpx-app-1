$(function(){"use strict";!function(){$(".btn-yzm").click(function(t){function e(){s.text("重新发送("+a+")"),a--,a<0&&(s.removeClass("disabled"),a=59,s.text("发送验证码(60)"),clearInterval(n))}var s=$(this);if(s.hasClass("disabled"))return!1;s.addClass("disabled");var a=59,n=setInterval(e,1e3);return!1})}()});