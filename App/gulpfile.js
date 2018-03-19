/// <binding BeforeBuild='build' ProjectOpened='default' />
// 引入 gulp
var gulp = require('gulp');


// 引入组件
var concat = require('gulp-concat')    //文件合并

gulp.task('default', function () {
    // 监听文件变化
    gulp.watch(['www/js/*/*'], ['build']);
});

gulp.task('build', function () {
    gulp.src('www/js/controller/*.js')
        .pipe(concat('controllers.js'))
        .pipe(gulp.dest('www/js'));

    gulp.src('www/js/service/*.js')
        .pipe(concat('services.js'))
        .pipe(gulp.dest('www/js'));
});