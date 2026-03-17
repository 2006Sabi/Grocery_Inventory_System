const Joi = require('joi');

const supplierSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  contactPerson: Joi.string().allow('', null),
});

module.exports = { supplierSchema };
