import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import watch from 'gulp-watch';
import nodemon from 'gulp-nodemon';
import stylus from 'gulp-stylus';
import browserSync from 'browser-sync';
import webpack from 'webpack-stream';
import wbpk_conf from './webpack.config';


gulp.task('dev', ['default', 'browser-sync']);
gulp.task('dev-nosync', ['default', 'no-sync']);
gulp.task('default', () => {
    return gulp.src(['app.js', 'routes/**/*.js', 'config/**/*.js'], { base: './' })
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist"));
});
gulp.task('no-sync', ['webpack', 'nodemon'], () => {
    gulp.watch(['app.js', 'routes/**/*.js', 'config/**/*.js'], ['default']);
    gulp.watch("public/javascripts/*.js", ['js-watch']);
});
//gulp.task('browser-sync', ['webpack', 'nodemon'], () => {
gulp.task('browser-sync', ['webpack-nodemon'], () => {
    browserSync({
        ui: {
            port: 5557,
        },
        proxy: {
            target: 'http://localhost:5555/',
            ws: false,
        },
        port: 5050,
        browser: "google chrome",
        reloadDelay: 1000,
        open: false,
    });
    //browserSync.init(null, {
    //    proxy: 'http://localhost:5555/',
    //    browser: "google chrome",
    //    port: 5556,
    //});
    gulp.watch(['app.js', 'routes/**/*.js', 'config/**/*.js'], ['default']).on('change', browserSync.reload);
    gulp.watch('public/stylesheets/*.styl', ['styl']);
    gulp.watch('views/*.jade').on('change', browserSync.reload);
    gulp.watch(["public/javascripts/*.js"], ['js-watch']).on('change', browserSync.reload);
});
gulp.task('webpack-nodemon', () => {
    return gulp.src(['public/javascripts/scripts.js'])
        .pipe(webpack(wbpk_conf))
        .on('error', () => {
            console.log('error is frontend script.');
        })
        .pipe(gulp.dest('dist/public/javascripts/'))
        .on('end', () => {
            nodemon({
                script: 'dist/app.js',
            }).on('start', () => {
                console.log('Webpacked and Nodemon starting...');
            });
        });
});
gulp.task('nodemon', () => {
    //let started = false;
    return nodemon({
        script: 'dist/app.js',
        tasks: ['webpack'],
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        //if (!started) {
        //    cb();
        //    started = true;
        //}
    });
});
gulp.task('webpack', () => {
    return gulp.src(['public/javascripts/scripts.js'])
        .pipe(webpack(wbpk_conf))
        .on('error', () => {
            console.log('error is frontend script.');
        })
        .pipe(gulp.dest('dist/public/javascripts/'));
});
gulp.task('js-watch', ['webpack']);//, browserSync.reload);
gulp.task('styl', () => {
    return gulp.src('public/stylesheets/*.styl')
        .pipe(stylus())
        .pipe(gulp.dest('dist/public/stylesheets/'))
        .pipe(browserSync.stream())
        .on("error", () => {});
});