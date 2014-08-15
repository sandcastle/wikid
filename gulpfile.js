var gulp = require('gulp'),
	karma = require('gulp-karma'),
	plumber = require('gulp-plumber');

var testFiles = [
	'lib/**/*.js',
	'tests/**/*.js'
];

gulp.task('test', function() {
	return gulp.src(testFiles)
		.pipe(plumber())
		.pipe(karma({ configFile: 'karma.conf.js' }))
		.on('error', function(err) { throw err; });
});

gulp.task('default', [
	'test'
]);
