var del = require('del');
var path = require('path');
var gulp = require('gulp');
var child_process = require('child_process');

var argv = require('yargs').argv;

var sass = require('gulp-sass');
var gutil = require('gulp-util');
var bless = require('gulp-bless');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglifyjs');
var webpack = require('gulp-webpack');
var minifycss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

var runSequence = require('run-sequence');

var package = require('./package.json');

var defaultAppName = argv.name ? argv.name : 'app';
var createRTL = argv.rtl ? true : false;
var production = argv.production ? true : false;
var port = argv.port ? argv.port : 8080;

/* file patterns to watch */
var paths = {
  index: ['src/static/jsx/'+defaultAppName+'/index.html', 'service.js'],
  jsx: ['src/static/jsx/*.jsx',  'src/static/jsx/**/*.jsx', 'src/static/jsx/**/**/*.jsx', 'src/static/jsx/**/**/**/*.jsx'], 
  scss: ['src/static/scss/*.scss','src/static/scss/**/*.scss']
};

var banner = function() {
  return '/*! '+package.name+' - v'+package.version+' - '+gutil.date(new Date(), "yyyy-mm-dd")+
          ' [copyright: '+package.copyright+']'+' */';
};

function logData(data) {
  gutil.log(
    gutil.colors.blue(
      gutil.colors.bold(data)
    )
  );
}

logData('Name : '+defaultAppName);
logData('RTL  : '+ (createRTL ? 'yes':'no'));
logData('PORT : '+ port);
logData('Environment : '+ (production ? 'Production':'Development'));

/* ---------------------------------- */
/* --------- BEGIN APP:SASS ---------- */
/* ---------------------------------- */
gulp.task('sass:app', function() {
  return gulp.src('src/static/scss/*.scss')
          .pipe(sass({
            // sourceComments: 'normal' // uncomment when https://github.com/sass/node-sass/issues/337 is fixed
          }))
          .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 9'))
          .pipe(insert.prepend(banner()+'\n'))
          .pipe(insert.prepend('@charset "UTF-8";\n'))
          .pipe(gulp.dest('build/public/css/'));
});

gulp.task('minifycss:app', function() {
  return gulp.src(['build/public/css/*.css'])
          .pipe(minifycss())
          .pipe(gulp.dest('public/css/min/'));
});

/* -------------------------------- */
/* --------- END APP:SASS ---------- */
/* -------------------------------- */


/* --------------------------------- */
/* ---------- BEGIN APP:JS --------- */
/* --------------------------------- */
gulp.task('react:app', function() {
  return gulp.src('src/static/jsx/'+defaultAppName+'.jsx')
          .pipe(webpack({
            cache: true,
            module: {
              loaders: [
                  {test: /[\.jsx|\.js]$/, loader: 'jsx-loader?harmony'}
                ]
              }
          }))
          .pipe(rename(defaultAppName+'.js'))
          .pipe(gulp.dest('build/public/js/'));
});

gulp.task('uglify:app', function() {
  return gulp.src('build/public/js/'+defaultAppName+'.js')
          .pipe(uglify(''+defaultAppName+'.min.js', {
            preserveComments: false,
            compress: {
              warnings: false
            }
          }))
          .pipe(insert.prepend(banner()))
          .pipe(gulp.dest('build/public/js/'));
});
/* ------------------------------- */
/* ---------- END APP:JS --------- */
/* ------------------------------- */


/* --------------------------------- */
/* --------- BEGIN EXPRESS --------- */
/* --------------------------------- */
var child = null;
gulp.task('express', function() {
  if(child) child.kill();
  child = child_process.spawn(process.execPath, ['./service.js'], {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      APP: defaultAppName,
      RTL: createRTL,
      PORT: port
    }
  });
  child.stdout.on('data', function(data) {
    gutil.log(gutil.colors.bgCyan(gutil.colors.blue(data.toString().trim())));
  });
  child.stderr.on('data', function(data) {
    gutil.log(gutil.colors.bgRed(gutil.colors.white(data.toString().trim())));
  });

  process.on('uncaughtException', function(err) {
    if(child) child.kill();
    throw new Error(err);
  });
});
/* ------------------------------- */
/* --------- END EXPRESS --------- */
/* ------------------------------- */




/* ------------------------------ */
/* --------- GULP TASKS --------- */
/* ------------------------------ */
gulp.task('sass', ['sass:app']);
gulp.task('app', ['react:app']);
gulp.task('uglify', ['uglify:app']);
gulp.task('minifycss', ['minifycss:app' ]);

gulp.task('build:css', ['sass']);
//gulp.task('build:essentials', ['react', 'react-bootstrap', 'react-l20n']);
gulp.task('build:app', ['app']);

gulp.task('build:dev', ['build:css', 'build:essentials', 'build:app']);
gulp.task('build:dist', ['minifycss', 'uglify']);

if(production) {
  logData('Building please wait...');
  gulp.task('default', function(callback) {
    runSequence('build:css', 'build:essentials', 'build:app', 'minifycss', 'uglify', function() {
      callback();
      gutil.log(
        gutil.colors.bgMagenta(
          gutil.colors.red(
            gutil.colors.bold('[          COMPLETED BUILD PROCESS          ]')
          )
        )
      );
    });
  });
} else {
  gulp.task('default', function(callback) {
    runSequence('build:css', 'build:essentials', 'build:app', ['express', 'watch'], callback);
  });  
}

/*BEGIN: ALIASES FOR CERTAIN TASKS (for Watch)*/
gulp.task('build:app:watch', ['build:app'], ready);
gulp.task('build:css:watch', ['build:css'], ready);
gulp.task('express:watch', ['express'], ready);
gulp.task('rebuild:css', ['build:css'], ready);
/*END: ALIASES*/

gulp.task('watch', function() {
  gulp.watch(paths.jsx, ['build:app:watch']);
  gulp.watch(paths.index, ['express:watch']);
  gulp.watch(paths.scss, ['rebuild:css']);
});

function ready() {
  gutil.log(
    gutil.colors.bgMagenta(
      gutil.colors.red(
        gutil.colors.bold('[          STATUS: READY          ]')
      )
    )
  );
}
