var exec = require('child_process').exec,
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-htmlmin');

gulp.task('scripts', function() {
    gulp.src(['bower_components/**/*.js', 'js/**/*.js'])
    .pipe(concat('gchart.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('min-index', function() {
    gulp.src('test/index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts', 'min-index']);