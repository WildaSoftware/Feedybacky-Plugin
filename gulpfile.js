'use strict';

const csso = require('gulp-csso');
const gulp = require('gulp');
const rename = require('gulp-rename');
const minify = require('gulp-minify');
const sass = require('gulp-sass')(require('sass'));

gulp.task('cssFile', function() {
	return gulp.src('./css/feedybacky.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(csso())
		.pipe(rename('feedybacky.min.css'))
		.pipe(gulp.dest('./css'))
});

gulp.task('jsFile', function() { 
	return gulp.src('./js/feedybacky.js')
		.pipe(minify({
			noSource: true,
			ext: '.min.js'
		}))
		.pipe(gulp.dest('./js'))
});

const tasks = ['cssFile', 'jsFile'];

gulp.task('default', gulp.parallel(...tasks));