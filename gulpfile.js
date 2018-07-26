var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mini = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var htmlmin = require("gulp-htmlmin"); /*don`t use it yet*/
var removeHtmlComm = require("gulp-remove-html-comments");
var run = require("run-sequence");
var del = require("del");
var broSync = require("browser-sync").create();
var currentBuild = "build 1.0";

gulp.task("clean", function(){
	return del("build 1.0");
});

gulp.task("copy", function(){
	return gulp.src([
		"source/fonts/**/*.{woff,woff2}",
		"source/images/**",
		"source/js/**"
	], {
		base: "source"
	})
	.pipe(gulp.dest("build 1.0"))
});

gulp.task("style", function(){
	gulp.src("source/less/style.less")
	.pipe(plumber())
	.pipe(less())
	.pipe(postcss([
			autoprefixer()
		]))
	.pipe(gulp.dest("build 1.0/css"))
	.pipe(mini())
	.pipe(rename("style.min.css"))
	.pipe(gulp.dest("build 1.0/css"))
	.pipe(broSync.stream());
}); 

gulp.task("images", function(){
	return gulp.src("source/images/**/*.{jpg, png, svg}")
	.pipe(imagemin([
		imagemin.optipng({optimizationLevel: 3}),
		imagemin.jpegtran({pogressive: true}),
		imagemin.svgo()
	]))
	.pipe(gulp.dest("source/images"))
});

gulp.task("sprite", function(){
	return gulp.src("source/images/icon-*.svg")
	.pipe(svgstore({
		inlineSvg: true
	}))
	.pipe(rename("sprite.svg"))
	.pipe(gulp.dest("build 1.0/images"));
});

gulp.task("html", function(){
	return gulp.src("source/*.html")
	.pipe(posthtml([
		include()
	]))
	.pipe(removeHtmlComm())
	.pipe(gulp.dest("build 1.0"))
		.on("change", broSync.reload);
});

gulp.task("serve", function(){
	broSync.init({
		server: "build 1.0/"
	});

	gulp.watch("source/less/**/*.less", ["style"]); 
	gulp.watch("source/*.html", ["html"]);
});

gulp.task("serve-mob", function(){
	broSync.init({
		server: "build 1.0/",
		tunnel:  'asalikova'
	});
	gulp.watch("source/less/**/*.less", ["style"]); 
	gulp.watch("source/*.html", ["html"]);
});

gulp.task("build", function(done){
	run(
		"clean",
		"copy",
		"style",
		"sprite", 
		"html", 
		done
	);
});

