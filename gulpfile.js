var exec         = require('child_process').exec,
    gulp         = require('gulp'),
    uglify       = require('gulp-uglify'),
    concat       = require('gulp-concat'),
    htmlmin      = require('gulp-htmlmin'),
    webstandards = require('gulp-webstandards')
    plumber      = require('gulp-plumber');

gulp.task('scripts', function() {
    gulp.src(['bower_components/**/*.js', 'app/js/**/*.js'])
    .pipe(plumber())
    .pipe(concat('gchart.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('min-index', function() {
    gulp.src('app/index.html')
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

gulp.task('webstandards', function() {
    gulp.src('dist/**')
    .pipe(webstandards());
});

gulp.task('watch', function() {
    gulp.watch(['app/js/**/*.js', 'app/index.html'], ['scripts', 'min-index', 'webstandards']);
});

gulp.task('default', ['scripts', 'min-index', 'webstandards', 'watch']);