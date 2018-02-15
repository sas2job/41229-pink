"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var server = require("browser-sync").create();
var run = require("run-sequence");
var del = require("del");

gulp.task("style", function() {
  gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      require("postcss-object-fit-images")
    ]))

    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream())
});

// for images

gulp.task("images", function () {
  return gulp.src("build/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
 ]))
 .pipe(gulp.dest("build/img"))
});

// for webp

gulp.task("webp", function () {
  return gulp.src("img/**/*.{png,jpg}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img"))
});

// for svg sprite

gulp.task("sprite", function () {
  return gulp.src("img/*.svg")
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"))
});

// for js

gulp.task("js", function() {
  return gulp.src(["js/*.js", "!js/*.min.js"])
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("build/js"))
});

// for html

gulp.task("html", function () {
  return gulp.src("*.html")
  .pipe(posthtml([
    include()
  ]))
  .pipe(server.stream())
  .pipe(gulp.dest("build"))
});

// clean build

gulp.task("clean", function () {
  return del("build");
});

// for copy

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**"
    ], {
      base: "."
    })
  .pipe(gulp.dest("build"))
});

//  for build

gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "style",
    "js",
    "images",
    "webp",
    "sprite",
    "html",
    done
  )
});


// browser

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  //gulp.watch("source/sass/**/*.{scss,sass}", ["style"]);
  //gulp.watch("source/*.html").on("change", server.reload)

  gulp.watch("scss/**/*.scss", ["style"]).on("change", server.reload);
  gulp.watch("*.html", ["html"]).on("change", server.reload);
  gulp.watch("js/*.js", ["js"]).on("change", server.reload);
});
