/**
 * Created by Capricorncd.
 * https://github.com/capricorncd
 * Date: 2020-08-10 23:06
 */
const { series, src, dest, watch } = require('gulp')
const stylus = require('gulp-stylus')
const rename = require('gulp-rename')
const header = require('gulp-header')
const cssBase64 = require('gulp-css-base64')
const uglify = require('gulp-uglify')
const config = require('./package.json')

// uglify
function handleUglify() {
  return src('./src/js/calendar-price-jquery.js')
    .pipe(rename('calendar-price-jquery.min.js'))
    .pipe(uglify())
    .pipe(header('/*! <%= name %> v<%= version %> | (c) <%= author %> | <%= homepage %> */', config))
    .pipe(dest('./dist/js'))
}

// stylus
function handleStylus (cb) {
  return src('./src/stylus/calendar-price-jquery.styl')
    .pipe(cssBase64())
    .pipe(stylus({
      compress: true
    }))
    .pipe(rename('calendar-price-jquery.min.css'))
    .pipe(header('/*! <%= name %> v<%= version %> | (c) <%= author %> | <%= homepage %> */', config))
    .pipe(dest('./dist/css'))
  cb()
}

function handleWatch() {
  watch('./src/js/*.js', handleUglify)
  watch('./src/stylus/*.styl', handleStylus)
}

exports.dev = series(handleStylus, handleUglify, handleWatch)
exports.build = series(handleStylus, handleUglify)
