var gulp = require('gulp')
var cssBase64 = require('gulp-css-base64')
var uglify = require('gulp-uglify')
var stylus = require('gulp-stylus')
var watch = require('gulp-watch')
var rename = require('gulp-rename')
var header = require('gulp-header')
var config = require('./package.json')
var argv = require('yargs').argv
// development or production
var isProd = argv.model === 'production'
console.log(isProd)

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

if (isProd) {
  gulp.task('default', ['uglify', 'stylus'])
} else {
  gulp.task('default', ['uglify', 'stylus', 'watch'])
}
