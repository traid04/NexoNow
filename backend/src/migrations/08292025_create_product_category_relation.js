const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable("product_categories", {
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "products",
          key: "id"
        }
    	},
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categories",
          key: "id"
        },
        primaryKey: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable("product_categories");
  }
}