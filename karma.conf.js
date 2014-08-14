module.exports = function(config) {
	config.set({

		// base path, that will be used to resolve files and exclude
		basePath: '',

		// list of files / patterns to load in the browser
		files: [
			'src/public/bower_components/jquery/dist/jquery.js',
			'src/public/bower_components/jquery-ui/ui/minified/jquery-ui.min.js',
			'src/public/bower_components/angular/angular.js',
			'src/public/bower_components/angular-mocks/angular-mocks.js',
			'src/public/bower_components/angular-resource/angular-resource.js',
			'src/public/bower_components/angular-cookies/angular-cookies.js',
			'src/public/bower_components/angular-sanitize/angular-sanitize.js',
			'src/public/bower_components/angular-animate/angular-animate.js',
			'src/public/bower_components/angular-ui-router/release/angular-ui-router.js',
			'src/public/bower_components/angular-ui-utils/ui-utils.js ',
			'src/public/bower_components/angular-toastr/dist/angular-toastr.js',
			'src/public/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
			'src/public/bower_components/lodash/dist/lodash.js',
			'src/public/bower_components/moment/moment.js',
			'src/public/bower_components/moment-timezone/builds/moment-timezone-with-data.js',
			'src/public/bower_components/angulartics/src/angulartics.js',
			'src/public/bower_components/angulartics/src/angulartics-ga.js',
			'src/public/bower_components/blueimp-file-upload/js/jquery.fileupload.js',
			'src/public/bower_components/blueimp-file-upload/js/jquery.fileupload-process.js',
			'src/public/bower_components/blueimp-file-upload/js/jquery.fileupload-angular.js',
			'src/public/bower_components/fullcalendar/dist/fullcalendar.js',
			'src/public/bower_components/angular-ui-calendar/src/calendar.js',
			'src/public/bower_components/angular-dragdrop/src/angular-dragdrop.js',
			'src/public/bower_components/angular-elastic/elastic.js',
			'src/public/bower_components/angular-moment/angular-moment.js',
			'src/public/bower_components/select2/select2.js',
			'src/public/bower_components/angular-ui-select2/src/select2.js',
			'src/public/temp_components/ui-map.js',
			'src/public/libs/md5/md5.js',
			'test/mock/**/*.js',
			'src/public/app/**/*.js',
			'test/spec/**/*.js'
		],

		// testing framework to use (jasmine/mocha/qunit/...)
		frameworks: ['jasmine'],

		// list of files / patterns to exclude
		exclude: [
			'src/public/app/*.js',
		],

		// web server port
		port: 8085,

		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],

		// Reporters for progress, build servers, etc.
		reporters: [
			'teamcity'
		],

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
};
