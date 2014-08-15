var gulp = require('gulp'),
	karma = require('gulp-karma');

var testFiles = [
	'lib/**/*.js',
	'tests/**/*.js'
];

gulp.task('test', function() {

	return gulp.src(testFiles)
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'run'
		}))
		.on('error', function(err) {
			throw err;
		});
});

gulp.task('default', function() {
	gulp.src(testFiles)
		.pipe(karma({
			configFile: 'karma.conf.js',
			action: 'watch'
		}));
});
