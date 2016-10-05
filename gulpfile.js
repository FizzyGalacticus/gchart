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
    .pipe(htmlmin({
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        useShortDoctype: true,
        removeRedundantAttributes: true,
        removeComments: true,
        removeAttributeQuotes: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch(['js/**/*.js', 'test/index.html'], ['scripts', 'min-index']);
});

gulp.task('default', ['scripts', 'min-index', 'watch']);