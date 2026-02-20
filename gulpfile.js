let preprocessor = 'sass', // Preprocessor (sass, less, styl); 'sass' also work with the Scss syntax in blocks/ folder.
	fileswatch = 'html,pug,htm,txt,json,md,woff2' // List of files extensions for watching & hard reload
import pkg from 'gulp'
const {
	gulp,
	src,
	dest,
	parallel,
	series,
	watch
} = pkg



import Fs from 'fs'

import browserSync from 'browser-sync'
import bssi from 'browsersync-ssi'
import ssi from 'ssi'
import webpackStream from 'webpack-stream'
import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import sassglob from 'gulp-sass-glob'
const sass = gulpSass(dartSass)
import less from 'gulp-less'
import lessglob from 'gulp-less-glob'
import styl from 'gulp-stylus'
import stylglob from 'gulp-noop'
import postCss from 'gulp-postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import changed from 'gulp-changed'
import concat from 'gulp-concat'
import rsync from 'gulp-rsync'
import pug from 'gulp-pug'





import {
	deleteAsync
} from 'del'


function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/',
			middleware: bssi({
				baseDir: 'app/',
				ext: '.html'
			})
		},
		ghostMode: {
			clicks: false
		},
		notify: false,
		online: true,
		// tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
	})
}



function scripts() {
	return src([
		'app/js/*.js',
		'!app/js/*.min.js'
	])
		.pipe(webpackStream({
			mode: 'production',
			performance: {
				hints: false
			},
			plugins: [
				new webpack.ProvidePlugin({
					$: 'jquery',
					jQuery: 'jquery',
					'window.jQuery': 'jquery'
				}), // jQuery (npm i jquery)
			],
			module: {
				rules: [{
					test: /\.m?js$/,
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				}]
			},
			optimization: {
				minimize: true,
				minimizer: [
					new TerserPlugin({
						terserOptions: {
							format: {
								comments: false
							}
						},
						extractComments: false
					})
				]
			},
		}, webpack)).on('error', (err) => {
			this.emit('end')
		})
		.pipe(concat('app.min.js'))
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src([`app/styles/${preprocessor}/*.*`, `!app/styles/${preprocessor}/_*.*`])
		.pipe(eval(`${preprocessor}glob`)())
		.pipe(eval(preprocessor)({
			'include css': true
		}))
		.pipe(postCss([
			autoprefixer({
				grid: 'autoplace'
			}),
			cssnano({
				preset: ['default', {
					discardComments: {
						removeAll: true
					}
				}]
			})
		]))
		.pipe(concat('app.min.css'))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

async function images() {

	await imagemin(['app/images/src/**/*.{jpg,png,svg,webp,ico}'], {
		destination: 'app/images/dist',
		plugins: [
			imageminWebp({ quality: 80 })
		]
	})
	browserSync.stream()
}

function buildcopy() {
	return src([
		'{app/js,app/css}/*.min.*',
		'app/images/**/*.*',
		'!app/images/src/**/*',
		'app/fonts/**/*',
		'app/**/*.html'
	], {
		base: 'app/'
	})
		.pipe(dest('dist'))
}

function pug2html() {
	let dataFromFile = JSON.parse(Fs.readFileSync('app/pug/includes/data.json'));
	return src('app/pug/*.pug')
		.pipe(changed('app', { extension: ['.html'] }))
		
		.pipe(
			pug({
				doctype: 'html',
				pretty: true,
				locals: dataFromFile || {}
			})
		)
		.pipe(dest('app'))
		.pipe(browserSync.stream());
};


async function buildhtml() {
	let includes = new ssi('app/', 'dist/', '/**/*.html')
	includes.compile()
	await deleteAsync('dist/parts', {
		force: true
	})
}

async function cleandist() {
	await deleteAsync(['dist/**/*', 'app/**/*.html'], {
		force: true
	})
}

function deploy() {
	return src('dist/')
		.pipe(rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// clean: true, // Mirror copy with file deletion
			include: [ /* '*.htaccess' */], // Included files to deploy,
			exclude: ['**/Thumbs.db', '**/*.DS_Store'],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch(`app/styles/${preprocessor}/**/*`, {
		usePolling: true
	}, styles)
	watch(['app/js/**/*.js', '!app/js/**/*.min.js'], {
		usePolling: true
	}, scripts)
	watch('app/images/src/**/*', {
		usePolling: true
	}, images)


	watch('app/pug/**/*', {
		usePolling: true
	}, pug2html)

	
	watch(`app/**/*.{${fileswatch}}`, {
		usePolling: true
	}).on('change', browserSync.reload)
}


export {
	scripts,
	styles,
	images,
	deploy
}
export let assets = series(scripts, styles, images)
export let build = series(cleandist, pug2html, buildhtml, scripts, styles, images, buildcopy)

export default series(scripts, styles, pug2html, images, parallel(browsersync, startwatch))

