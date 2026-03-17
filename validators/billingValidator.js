const Joi = require('joi');

const billingSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
    })
  ).min(1).required(),
  gstRate: Joi.number().valid(5, 12, 18).required(),
});

module.exports = { billingSchema };
