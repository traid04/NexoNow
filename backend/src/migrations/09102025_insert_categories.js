const { DataTypes } = require('sequelize');

module.exports = {
	up: async ({ context: queryInterface }) => {
		await queryInterface.bulkInsert('categories', [
			{ name: 'Electrónica' },
			{ name: 'Celulares y Accesorios' },
			{ name: 'Computación' },
			{ name: 'Consolas y Videojuegos' },
			{ name: 'Electrodomésticos' },
			{ name: 'Hogar y Muebles' },
			{ name: 'Ropa y Accesorios' },
			{ name: 'Calzado' },
			{ name: 'Joyas y Relojes' },
			{ name: 'Deportes y Fitness' },
			{ name: 'Salud y Belleza' },
			{ name: 'Juguetes y Juegos' },
			{ name: 'Bebés' },
			{ name: 'Libros' },
			{ name: 'Instrumentos Musicales' },
			{ name: 'Herramientas' },
			{ name: 'Construcción' },
			{ name: 'Automóviles y Motos' },
			{ name: 'Accesorios para Vehículos' },
			{ name: 'Arte y Artesanías' },
			{ name: 'Oficina y Papelería' },
			{ name: 'Mascotas' },
			{ name: 'Jardinería' },
			{ name: 'Alimentos y Bebidas' }
		])
	},
	down: async ({ context: queryInterface }) => {
		await queryInterface.bulkDelete('categories', {
			name: [
				'Electrónica',
				'Celulares y Accesorios',
				'Computación',
				'Consolas y Videojuegos',
				'Electrodomésticos',
				'Hogar y Muebles',
				'Ropa y Accesorios',
				'Calzado',
				'Joyas y Relojes',
				'Deportes y Fitness',
				'Salud y Belleza',
				'Juguetes y Juegos',
				'Bebés',
				'Libros',
				'Instrumentos Musicales',
				'Herramientas',
				'Construcción',
				'Automóviles y Motos',
				'Accesorios para Vehículos',
				'Arte y Artesanías',
				'Oficina y Papelería',
				'Mascotas',
				'Jardinería',
				'Alimentos y Bebidas'
			]
		})
	}
}