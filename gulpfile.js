let wp_project          = require('./wp_project.json');
let sshpass             = require('./sshpass.json');

const browserSync       = require('browser-sync');
const gulp              = require('gulp');
const gulpAppendPrepend = require('gulp-append-prepend');
const gulpConcat        = require('gulp-concat');
const gulpClean         = require('gulp-clean');
const gulpLEC           = require('gulp-line-ending-corrector');
const gulpNotify        = require('gulp-notify');
const gulpRename        = require('gulp-rename');
const gulpSass          = require('gulp-sass');
const gulpSequence      = require('gulp-sequence');
const gulpSourcemaps    = require('gulp-sourcemaps');
const gulpSSH           = require('gulp-ssh');
const gulpUglify        = require('gulp-uglify');
const gulpZip           = require('gulp-zip');


let ssh = new gulpSSH({
    ignoreErrors: false,
    sshConfig: sshpass
});

gulp.task('browser-sync', () => {
    browserSync.init({
        proxy: wp_project.build.proxy,
        open: true,
        injectChanges: true
    })
});

gulp.task('style', () => {

    let headers = "/**!\n";
    headers += "Theme Name: " + wp_project.theme.name + "\n";
    headers += "Theme URI: " + wp_project.theme.URI + "\n";
    headers += "Author: " + wp_project.theme.author + "\n";
    headers += "Author URI: " + wp_project.theme.authorURI + "\n";
    headers += "Theme Description: " + wp_project.theme.description + "\n";
    headers += "Theme version: " + wp_project.theme.version + "\n";
    headers += "License: " + wp_project.theme.license + "\n";
    headers += "License URI: " + wp_project.theme.licenseURI + "\n";
    headers += "Tags: " + wp_project.theme.tags.join(', ') + "\n";
    headers += "Text Domain: " + wp_project.theme.textDomain + "\n";
    headers += "*/";

    return gulp.src(wp_project.build.style.src)
    .pipe(gulpAppendPrepend.prependText(headers))
    .pipe(gulpSourcemaps.init())
    .pipe(gulpSass({
        errLogToConsole: true,
        outputStyle: 'compact'
    }))
    .on('error', console.error.bind(console))
    .pipe(gulpSourcemaps.write({includeContent: false}))
    .pipe(gulpSourcemaps.init({loadMaps: true}))
    .pipe(gulpSourcemaps.write('./'))
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.style.dest))
    .pipe(browserSync.stream());
})

gulp.task('vendorJS', () => {
    return gulp.src(wp_project.build.vendorJS.src)
    .pipe(gulpConcat('vendor.js'))
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.vendorJS.dest))
    .pipe(gulpRename({suffix: '.min'}))
    .pipe(gulpUglify())
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.vendorJS.dest));
});

gulp.task('customJS', () => {
    return gulp.src(wp_project.build.customJS.src)
    .pipe(gulpConcat('custom.js'))
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.customJS.dest))
    .pipe(gulpRename({suffix: '.min'}))
    .pipe(gulpUglify())
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.customJS.dest));
});

gulp.task('views', () => {
    return gulp.src(wp_project.build.views.src)
    .pipe(gulpLEC())
    .pipe(gulp.dest(wp_project.build.views.dest));
});

gulp.task('zip', () => {
    return gulp.src([wp_project.build.zip + "**"])
    .pipe(gulpZip(wp_project.theme.name + "-v" + wp_project.theme.version + ".zip"))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('clean', () => {
    return gulp.src([wp_project.build.style.dest,
        wp_project.build.vendorJS.dest,
        wp_project.build.customJS.dest,
        wp_project.build.views.dest])
    .pipe(gulpClean());
});

gulp.task('ssh-clean', () => {
    
});



gulp.task('build', ['clean'], gulpSequence(['style', 'vendorJS', 'customJS', 'views'], 'zip'));

gulp.task('default', ['browser-sync'], () => {

    gulpSequence(['style', 'vendorJS', 'customJS', 'views'], 'zip', browserSync.reload);

    gulp.watch(wp_project.build.style.watch, () => gulpSequence('style', 'zip', browserSync.reload));
    gulp.watch(wp_project.build.vendorJS.watch, () => gulpSequence('vendorJS', 'zip', browserSync.reload));
    gulp.watch(wp_project.build.customJS.watch, () => gulpSequence('customJS', 'zip', browserSync.reload));
    gulp.watch(wp_project.build.views.watch, () => gulpSequence('views', 'zip', browserSync.reload));
});