var gulp = require('gulp');
var path = require('path');
var $ = require('gulp-load-plugins')();
var del = require('del');
var isProduction = false;
var concatCss = require('gulp-concat-css');

var browserSync = require('browser-sync');
var reload      = browserSync.reload;
var watchify   = require('watchify');
var notify = require('gulp-notify');

var port = 1338;
var dist = './dist/';
var datetime = "node_modules/react-datetime/css/";
var source     = require('vinyl-source-stream');

var browserify = require("browserify");
var babelify = require("babelify");

// https://github.com/ai/autoprefixer
var autoprefixerBrowsers = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 6',
  'opera >= 23',
  'ios >= 6',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('browserify', function () {
  console.log("browserify started")
  var watcher = watchify(
    browserify({
      entries: ['./src/js/app.js'],
      debug: true,
      cache: {},
      packageCache: {}
    })
      .transform(babelify)
   );
  function bundle () {
    return watcher
      .bundle()
      .on('error', function(err) {
            return notify().write(err);
        })
      .pipe(source('src/js/app.js'))
      .pipe(gulp.dest('./dist'));
  }

  function update () {
    var updateStart = Date.now();

    console.log('JavaScript changed - recomiling via Browserify');

    bundle()
      .on('error', function(err) {
            return notify().write(err);
        })
      .on('end', function () {
        console.log('Complete!', (Date.now() - updateStart) + 'ms');
        browserSync.reload();

      });
  }

  watcher.on('update', update);

  return bundle();
});

// copy html from app to dist
gulp.task('html', function() {
  var pipeRes =  gulp.src('./src/index.html')
    .pipe(gulp.dest(dist))
    .on('end', function() {
      browserSync.reload();
    });

    return pipeRes;
    //.pipe(browserSync.reload);
    //.pipe($.connect.reload());
});

gulp.task('styles', function(cb){
  'bundle.css';
  // convert stylus to css
  return gulp.src(['src/css/*.css', ])
    .pipe(concatCss('bundle.css'))
    //.pipe($.autoprefixer({browsers: autoprefixerBrowsers}))
    .pipe(gulp.dest(dist + 'css/'))
    .pipe(browserSync.stream())
    .on('end', function() {
      browserSync.reload();
    });
    //.pipe($.connect.reload());
});

// add livereload on the given port
gulp.task('serve', function() {
  $.connect.server({
    root: dist,
    port: port,
    livereload: {
      port: 35729
    }
  });
});

// browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    browserSync({
        open: true,
        port: port,
        server: {
            baseDir: dist
        }
    });
});

// copy images
// gulp.task('images', function(cb) {
//   return gulp.src(app + 'images/**/*.{png,jpg,jpeg,gif,svg,ico}')
//     .pipe($.size({ title: 'images' }))
//     .pipe(gulp.dest(dist + 'images/'));
// });
//
// // copy fonts
// gulp.task('fonts', function(cb) {
//   return gulp.src(app + 'fonts/*')
//     .pipe($.size({ title: 'fonts' }))
//     .pipe(gulp.dest(dist + 'fonts/'));
// });

gulp.task('reload', function(){
  browserSync.reload();
});

// watch styl, html and js file changes
gulp.task('watch', function() {
  gulp.watch('./src/css/*.css', ['styles']);
  gulp.watch('./src/index.html', ['html']);
});


// remove bundles
// gulp.task('clean', function(cb) {
//   del([dist], cb);
// });

gulp.task('clean', function(cb) {
  del([dist]).then(function(){
    cb();
  });
});


// by default build project and then watch files in order to trigger livereload
//gulp.task('default', ['build', 'serve', 'watch']);
gulp.task('default', ['build', 'browser-sync', 'watch']);

// waits until clean is finished then builds the project for deployment
gulp.task('buildDeploy', ['clean'], function(){
  gulp.start(['html', 'styles', 'scripts']);
});

// waits until clean is finished then builds the project for development
gulp.task('build', ['clean'], function(){
  gulp.start(['html', 'styles', 'browserify']);
});
