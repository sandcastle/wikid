
var fs			= require('fs'),
	gulp 		= require('gulp'),
	karma 		= require('gulp-karma'),
	rimraf 		= require('gulp-rimraf'),
	concat 		= require('gulp-concat-util'),
	uglify 		= require('gulp-uglify'),
	rename 		= require('gulp-rename'),
	size	 	= require('gulp-size'),
	gutil 		= require('gulp-util'),
	formatter 	= require('gulp-esformatter');

var files = {

	// all files for executing tests
	test: [
		'lib/**/*.js',
		'tests/**/*.js'
	],

	// all files for client build
	client: [
		'lib/**/*.js'
	]
};

// clean
gulp.task('clean', function (cb) {
	rimraf('./dest', cb);
});

// test
gulp.task('test', function() {
	return gulp.src(files.test)
		.pipe(karma({ configFile: 'karma.conf.js' }))
		.on('error', gutil.log);
});

// output files
gulp.task('output', function(){
	return gulp.src(files.client)
		.pipe(concat('Wikid.js', { process: normalizeFiles }))
		.pipe(concat.header(fs.readFileSync('./build/header')))
		.pipe(concat.footer(fs.readFileSync('./build/footer')))
		.pipe(formatter({indent: {value: '  '} }))
		.pipe(size())
		.pipe(gulp.dest('./dist/'))
		.pipe(uglify())
		.pipe(rename('Wikid.min.js'))
		.pipe(size())
		.pipe(gulp.dest('./dist/'))
		.on('error', gutil.log);
});


gulp.task('build', [
	'clean',
	'output'
]);


gulp.task('default', [
	'clean',
	'test',
	'output'
]);

/**
 * Trims the files and removes 'use strict' statements.
 */
function normalizeFiles(src){

	//trim the file
	src = src.trim() + '\n';

	//remove duplicate 'use strict' statements
	return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
}