const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  barcode: Joi.string().required(),
  categoryId: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).default(0).required(),
  threshold: Joi.number().min(0).default(5).required(),
  expiryDate: Joi.date().required(),
  supplierId: Joi.string().required(),
});

module.exports = { productSchema };
