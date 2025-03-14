const path = require('path');

module.exports = {
	// Fichier d'entrée :
	entry: './src/client/Game.js',
	// Fichier de sortie :
	output: {
		path: path.resolve(__dirname, './public/'),
		filename: 'main.bundle.js',
		publicPath: '/',
	},
	// compatibilité anciens navigateurs (si besoin du support de IE11 ou android 4.4)
	target: ['web', 'es5'],
	// connexion webpack <-> babel :
	module: {
		rules: [
			{
				test: /\.js$/, // tous les fichiers js ...
				exclude: /node_modules/, // ... sauf le dossier node_modules ...
				use: {
					// ... seront compilés par babel !
					loader: 'babel-loader',
				},
			},
		],
	},
	devtool: 'source-map',
	devServer: {
		hot: false, // désactivation hot-reload (inutilisé)
		static: {
			directory: './public', // racine du serveur http
			watch: {
				// optimisation live-reload
				ignored: 'node_modules',
			},
		},
		port: 8000,
		historyApiFallback: true, // gestion deeplinking
	},
};
