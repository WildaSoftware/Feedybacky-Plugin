'use strict';

const csso = require('gulp-csso');
const gulp = require('gulp');
const rename = require('gulp-rename');
const minify = require('gulp-minify');

gulp.task('cssFile', function() {
	gulp.src('./css/feedybacky.css')
		.pipe(csso())
		.pipe(rename('feedybacky.min.css'))
		.pipe(gulp.dest('./css'))
});

gulp.task('jsFile', function() { 
	gulp.src('./js/feedybacky.js')
		.pipe(minify({
	        ext: {
	            min: '.min.js'
	        }
	    }))
		.pipe(gulp.dest('./js'))
});

const tasks = ['cssFile', 'jsFile'];

gulp.task('default', gulp.parallel(...tasks));