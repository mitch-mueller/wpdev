const wp_project        = require('./wp_project.json');

const browserSync       = require('browser-sync');
const gulp              = require('gulp');
const gulpNotify        = require('gulp-notify');
const gulpSass          = require('gulp-sass');
const gulpSequence      = require('gulp-sequence');
const gulpSftp          = require('gulp-sftp');
const gulpSourcemaps    = require('gulp-sourcemaps');
const gulpUglify        = require('gulp-uglify');


gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: wp_project.build.proxy,
        open: true,
        injectChanges: true
    })
})

gulp.task('default', function() {
    
});