var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var gulpIf = require('gulp-if');

gulp.task('dist', function() {
  return gulp.src('src/index.html')
    .pipe(useref())
    .pipe(gulpIf('src/*.js', uglify()))
    .pipe(gulpIf('src/*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('compress', function() {
  return gulp.src('dist/*.js')
    .pipe(uglify( { mangle: true } ))
    .pipe(gulp.dest('dist'))
});
