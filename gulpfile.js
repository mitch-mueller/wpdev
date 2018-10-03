let wp_project          = require('./wp_project.json');
let sshpass             = require(wp_project.build.ssh.authFile);

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
const gulpSftp          = require('gulp-sftp');
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

gulp.task('assets', () => {
    return gulp.src(wp_project.build.assets.src)
    .pipe(gulp.dest(wp_project.build.assets.dest))
})

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
    //return ssh.exec('whoami').on('ssh2Data', e => console.log(e.toString('utf8')));
    return ssh.exec("cd " + wp_project.build.ssh.path + "/wp-content/themes && rm -rdf " + wp_project.theme.name /*+ " && mkdir " + wp_project.theme.name*/)
    .on('ssh2Data', e => console.log(e.toString('utf8')));
});

gulp.task('sftp-upload', () => {
    return gulp.src([wp_project.build.ssh.src + '*', wp_project.build.ssh.src + '**/*'])
    .pipe(gulpSftp({
        host: sshpass.host,
        port: sshpass.port,
        user: sshpass.username,
        pass: sshpass.password,
        remotePath: wp_project.build.ssh.path + '/wp-content/themes/' + wp_project.theme.name,
    }));
})



gulp.task('build', ['clean', 'ssh-clean'], gulpSequence(['style', 'vendorJS', 'customJS', 'views', 'assets'], ['zip', 'sftp-upload']));

gulp.task('default', ['browser-sync'], () => {

    gulpSequence('clean', ['style', 'vendorJS', 'customJS', 'views', 'assets'], 'zip', 'ssh-clean', 'sftp-upload', browserSync.reload);

    // SCSS-Watcher
    gulp.watch(wp_project.build.style.watch + "**/*.scss", () => gulpSequence('style', 'zip', 'ssh-clean', 'sftp-upload', browserSync.reload));
    
    // Assets-Watcher
    gulp.watch(
        [ wp_project.build.assets.watch + "*",
          wp_project.build.assets.watch + "**/*"],
          () => gulpSequence('assets', 'zip', 'ssh-clean', 'sftp-upload', browserSync.reload)
    );

    // VendorJS-Watcher
    gulp.watch(
        [ wp_project.build.vendorJS.watch + "*.js",
          wp_project.build.vendorJS.watch + "**/*.js"],
        () => gulpSequence('vendorJS', 'zip', 'ssh-clean', 'sftp-upload', browserSync.reload)
    );

    // CustomJS-Watcher
    gulp.watch(
        [ wp_project.build.customJS.watch + "*.js",
          wp_project.build.customJS.watch + "**/*.js" ],
        () => gulpSequence('customJS', 'zip', 'ssh-clean', 'sftp-upload', browserSync.reload)
    );

    // Views-Watcher
    gulp.watch(
        [ wp_project.build.views.watch + "*.php",
            wp_project.build.views.watch + "**/*.php"], 
        () => gulpSequence('views', 'zip', 'ssh-clean', 'sftp-upload', browserSync.reload)
    );
});