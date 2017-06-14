/* File: gulpfile.js */

var gulp  = require('gulp');
var gutil = require('gulp-util');

var minifyCSS = require('gulp-minify-css');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('minifyCSS', function() {
	gutil.log('Gulp is minify CSS!');

	gulp.src(['!./css/style.min.css', '!./css/font-awesome.min.css', '!./css/bootstrap.min.css', './css/*.css'])
    	.pipe(minifyCSS({keepSpecialComments : 0}))
    	.pipe(concat('style.min.css'))
    	.pipe(gulp.dest('./css/'));
});


gulp.task('minifyJS', function() {
	gutil.log('Gulp is minify JS!');

  gulp.src(['!./js/main.min.js', './js/*.js'])
	//gulp.src('js/*.js')		
  		//.pipe(concat('main.min.js'))  		
  		.pipe(uglify({
      		compress: {
        		drop_console: true
      		}
		}).on('error', function(e){
            console.log(e);
         }))
    	.pipe(concat('main.min.js'))
  		//.pipe(gulp.dest('./js/'));
  		.pipe(gulp.dest('./js/'));
});

// create a default task and just log a message
gulp.task('default',['minifyJS', 'minifyCSS'], function() {
  gutil.log('Gulp is running!');
});


gulp.task('scripts', ['clean'], function () {
      return gulp.src('js/*.js')
        .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
        .pipe(gulp.dest('minjs'));
  });