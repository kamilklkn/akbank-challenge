    // modules
    var gulp = require('gulp'),
        noop = require('gulp-noop'),
        newer = require('gulp-newer'),
        size = require('gulp-size'),
        imagemin = require('gulp-imagemin'),
        sass = require('gulp-sass'),
        prefix = require('gulp-autoprefixer'),
        postcss = require('gulp-postcss'),
        assets = require('postcss-assets'),
        sourcemaps = devBuild ? require('gulp-sourcemaps') : null,
        devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),
        browserSync = require('browser-sync').create();

    console.log('Gulp', devBuild ? 'development' : 'production', '_site');

    // directory locations
    var src = 'src/';
    var build = '_site/';
    // directory images locations
    var srcImg = src + 'images/*.+(png|jpg|gif|svg)';
    var buildImg = build + 'images/';
    // directory Css locations
    var SCssSrc = src + 'scss/main.scss';
    var SCssWatch = src + 'scss/**/*';
    var SCssBuild = build + 'css/';
    // directory js locations
    var JsSrc = src + 'js/**/*';
    var CssSrc = src + 'css/**/*';



    /**************** Görselleri Optimize Et****************/

    gulp.task('compressImages', function() {
        return gulp.src(srcImg)
            .pipe(newer(buildImg))
            .pipe(imagemin({ progressive: true, optimizationLevel: 10 }))
            .pipe(size({ showFiles: true })) //Show file name and file optimayze kb
            .pipe(gulp.dest(buildImg));

    });
    /**************** Sıkıştırma Olmadan Dosyaları Taşı ****************/
    gulp.task('move-files', function() {
        gulp.src(JsSrc)
            .pipe(gulp.dest(build + 'js'));
        gulp.src('./*.html')
            .pipe(gulp.dest(build));
    });
    //Static Server + watching scss / html files
    gulp.task('serve', ['move-files', 'sass'], function() {

        browserSync.init({
            server: {
                baseDir: './',
                index: 'index.html'
            }
            //port: 8000,
            //files: dir.build + '**/*',
            //open: true
        });

        gulp.watch(src + "/scss/*.scss", ['sass']);
        gulp.watch(JsSrc).on('change', browserSync.reload);
        gulp.watch("./*.html").on('change', browserSync.reload);
    });

    /**************** CSS task ****************/


    const cssConfig = {

        sassOpts: {
            sourceMap: devBuild,
            outputStyle: 'nested',
            imagePath: '/images/',
            precision: 3,
            errLogToConsole: true
        },

        postCSS: [
            require('postcss-assets')({
                loadPaths: ['images/'],
                basePath: SCssBuild
            }),
            require('autoprefixer')({
                browsers: ['> 1%']
            })
        ]

    };

    // Compile sass into CSS & auto-inject into browsers
    gulp.task('sass', function() {
        //console.log('Here to sass);
        return gulp.src(SCssSrc)
            .pipe(sass({
                includePaths: ['css'],
                onError: browserSync.notify
            }))
            .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
            .pipe(sourcemaps ? sourcemaps.init() : noop())
            .pipe(sass(cssConfig.sassOpts).on('error', sass.logError))
            .pipe(postcss(cssConfig.postCSS))
            .pipe(sourcemaps ? sourcemaps.write() : noop())
            .pipe(size({ showFiles: true }))
            .pipe(gulp.dest(SCssBuild))
            .pipe(browserSync.stream());
    });

    /**************** Dosyaları izle ****************/

    gulp.task('watch', function() {
        gulp.watch(SCssWatch, ['sass']);
    });


    gulp.task('default', ['compressImages', 'serve', 'watch']);