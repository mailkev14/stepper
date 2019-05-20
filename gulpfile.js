'use-strict'

var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass');

gulp.task('sass', function(){
    return gulp.src('assets/scss/style.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error',function(e){
        this.emit('end');
        console.log(e);
    }))
    .pipe(autoprefixer('last 50 versions'))
    .pipe(gulp.dest('assets/css'));
});

gulp.task('watch', function () {
	gulp.watch('assets/scss/**/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);