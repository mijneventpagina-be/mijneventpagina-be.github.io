/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const metalsmith = require('metalsmith');
const metalsmithSugar = require('metalsmith-sugar');
const collections = require('@metalsmith/collections');
const handlebarsHelpers = require('./helpers/handlebarsBasics');

const addCollectionPages = require('./addCollectionPages');

const isProduction = process.env.NODE_ENV === 'production';
const siteUrl = isProduction ? 'https://mijneventpagina.be' : 'https://localhost:3000';

function build() {
	const t1 = performance.now();

	const sugar = metalsmithSugar({
		metalsmith,
		metadata: {
			isProduction,
			site: {
				title: 'Mijn event pagina',
				description:
					'Maak indruk met op maat gemaakte websites voor uw speciale gelegenheden. Eigen domein en RSVP-functionaliteit inbegrepen. Neem contact met ons op voor een onvergetelijke ervaring!',
				url: siteUrl,
			},
			contact: {
				mail: 'info@mijneventpagina.be',
				phone: '+324 97 16 15 85',
				address: 'Bokstraat 19, 9870 Zulte-Machelen',
				btw: 'BE0785782944',
			},
		},
	});

	sugar
		.use('@metalsmith/sass', {
			loadPaths: ['node_modules'],
		})

		// resize images
		.use('metalsmith-sharp', {
			methods: [
				{
					name: 'resize',
					args: {
						width: 800,
						height: 800,
						fit: 'contain',
						background: '#fff',
					},
				},
				{
					name: 'rotate',
				},
			],
		})

		.use('metalsmith-project-images', {
			pattern: 'artikelen/*.md',
			imagesDirectory: f =>
				f
					.split('.')
					.slice(0, -1)
					.join('.') // remove file extension
					.split('/')
					.slice(1)
					.join('/'), // remove first directory (artikelen)
		})

		.use('@metalsmith/drafts')
		.use('@metalsmith/markdown')
/*		.use(
			collections({
				artikelen: {
					pattern: 'artikelen/*',
				},
			})
		)*/

		// .use('metalsmith-register-helpers')
		.use('metalsmith-handlebars-x', {
			helpers: handlebarsHelpers,
		})

		.use('@metalsmith/in-place')

		// root path is use in layouts
		.use('metalsmith-rootpath')

/*/		.use('@metalsmith/layouts', {
			default: 'article.hbs',
			pattern: 'artikelen/*.html',
		})

		.use(addCollectionPages())*/

		.use('@metalsmith/layouts')
		.use('metalsmith-native-lazy-loading', { selector: 'carousel' })

		// do assets as last to avoid manipulation
		.use('metalsmith-assets-improved', {
			dest: 'assets',
		})
		.use('metalsmith-assets-improved', {
			src: path.join(__dirname, 'icons'),
			dest: 'icons',
		})

		.use('metalsmith-sitemap', {
			hostname: siteUrl,
		})

		.use('metalsmith-link-checker', {
			ignore: ['assets', 'icons', siteUrl],
		})

		.use('metalsmith-debug')
		.use('debug') // metalsmith-native-lazy-loading uses debug instead of metalsmith-debug

		.build(err => {
			if (err) {
				throw err;
			}
			/* eslint-disable no-console */
			console.log(`Build success in ${((performance.now() - t1) / 1000).toFixed(1)}s`);
		});
}

if (require.main === module) {
	build();
} else {
	module.exports = build;
}
