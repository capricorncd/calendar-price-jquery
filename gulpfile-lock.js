const gulp = require('gulp')
const cssBase64 = require('gulp-css-base64')
const uglify = require('gulp-uglify')
const stylus = require('gulp-stylus')
const rename = require('gulp-rename')
const header = require('gulp-header')
const config = require('./package.json')

// uglify
gulp.task('uglify', function () {
  return gulp.src('./src/js/calendar-price-jquery.js')
    .pipe(rename('calendar-price-jquery.min.js'))
    .pipe(uglify())
    .pipe(header('/*! <%= name %> v<%= version %> | (c) <%= author %> | <%= homepage %> */', config))
    .pipe(gulp.dest('./dist/js'))
})

// stylus
gulp.task('stylus', function () {
  return gulp.src('./src/stylus/calendar-price-jquery.styl')
    .pipe(cssBase64())
    .pipe(stylus({
      compress: true
    }))
    .pipe(rename('calendar-price-jquery.min.css'))
    .pipe(header('/*! <%= name %> v<%= version %> | (c) <%= author %> | <%= homepage %> */', config))
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('watch', function () {
  gulp.watch('./src/js/*.js', ['uglify'])
  gulp.watch('./src/stylus/*.styl', ['stylus'])
})

gulp.task('build', ['uglify', 'stylus'])
gulp.task('dev', ['uglify', 'stylus', 'watch'])
