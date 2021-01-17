const {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(''),
    fileinclude = require('gulp-file-include'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    htmlMin = require('gulp-htmlmin'),
    webpCss = require('gulp-webp-css'),
    svgSprite = require('gulp-svg-sprite'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    del = require('del'),
    fs = require('fs'),
    source = 'src',
    project = 'build';

const path = {
    build:{
        html: project + '/',
        css: project + '/css/',
        js: project + '/js/',
        img: project + '/img/',
        fonts: project + '/fonts/',
    },
    src:{
        html: [source + '/*.html', "!" + source + '/@*.html', "!" + source + '/!*.html'],
        css: source + '/scss/style.scss',
        js: source + '/js/js.js',
        img: source + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        svgSprite: source + '/img/',
        fonts: source + '/fonts/*.ttf',
    },
    watch:{
        html: source + '/**/*.html',
        css: source + '/scss/**/*.scss',
        js: source + '/js/**/*.js',
        img: source + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    },
    clean: './' + project + '/'
}

function browserSync() {
    browsersync.init({
        server:{
            baseDir: `./${project}/`,
            index: 'index.html'
        },
        browser: 'google chrome',
        minify: false,
        port: 3000,
        notify: false,
        online: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(htmlMin({
            collapseWhitespace: false,
            removeComments: true
        }))
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            sass({
                outputStyle: 'expanded'
            })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist:  ['last 3 versions'],
                cascade: true
            })
        )
        .pipe(webpCss(['.jpg','.jpeg','.png']))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream()) 
}

function js_js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(babel())
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream()) 
}

function js_jquery() {
    return src([
            source + '/js/jquery-3.5.1.slim.min.js',
            source + '/js/jquery.validate.min.js',
            source + '/js/jquery.inputmask.min.js'
        ])
        .pipe(dest(project + '/js'));
}

function copy_files() {
    return src([source + '/public/*'])
        .pipe(dest(project));
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 75
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream()) 
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));

    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

// SVG Sprite social networks
config = {
    shape: {
        dimension: {
            maxWidth: 22,
            maxHeight: 22
        },
        spacing: {
            padding: 0
        },
    },
    mode: {
        stack: {
            prefix: ".icon__",
            dimensions: "%s",
            sprite: '../img/social_networks.svg',
            render: {
                scss: {
                    dest: '../scss/sprite.scss'
                }
            }, example: true
        }
    }
};

gulp.task('svgSprite', function() {
    return gulp.src([source + '/icon_sprite/*.svg'])
        .pipe(svgSprite(config))
        .pipe(dest(source))
});
// END. SVG Sprite social networks

function fontsStyle() {
    let file_content = fs.readFileSync(source + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb(){}

function clean() {
    return del(path.clean);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js_js);
    gulp.watch([path.watch.img], images);
}

const build = gulp.series(
    clean, 
    gulp.parallel(images, fonts, js_js, js_jquery, copy_files, css, html), 
    fontsStyle
);

const watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.html = html;
exports.css = css;
exports.js_js = js_js;
exports.js_jquery = js_jquery;
exports.copy_files = copy_files;
exports.images = images;
exports.build = build;
exports.watch = watch;
exports.default = watch;
