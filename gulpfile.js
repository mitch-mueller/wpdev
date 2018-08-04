const wp_project        = require('./wp_project.json');

const browserSync       = require('browser-sync');
const gulp              = require('gulp');
const gulpConcat        = require('gulp-concat');
const gulpLEC           = require('gulp-line-ending-corrector');
const gulpNotify        = require('gulp-notify');
const gulpRename        = require('gulp-rename');
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

gulp.task('style', function() {
    return gulp.src(wp_project.build.style.src)
    .pipe(gulpSourcemaps.init())
    .pipe(gulpSass({
        errLogToConsole: true,
        outputStyle: 'compressed'
    }))
    .on('error', console.error.bind(console))
    .pipe(gulpSourcemaps.write({includeContent: false}))
    .pipe(gulpSourcemaps.init({loadMaps: true}))
    .pipe(gulpSourcemaps.write('./'))
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.style.dest))
    .pipe(browserSync.stream());
})

gulp.task('vendorJS', function() {
    return gulp.src(wp_project.build.vendorJS.src)
    .pipe(gulpConcat('vendor.js'))
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.vendorJS.dest))
    .pipe(gulpRename({suffix: '.min'}))
    .pipe(gulpUglify())
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.vendorJS.dest));
});

gulp.task('customJS', function() {
    return gulp.src(wp_project.build.customJS.src)
    .pipe(gulpConcat('custom.js'))
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.customJS.dest))
    .pipe(gulpRename({suffix: '.min'}))
    .pipe(gulpUglify())
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.customJS.dest));
});

gulp.task('views', function() {
    return gulp.src(wp_project.build.views.src)
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.views.dest));
})

gulp.task('default', function() {
    
});