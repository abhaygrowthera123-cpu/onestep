import Joi from 'joi';

const itemSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  quantity: Joi.number().integer().min(1).required(),
  size: Joi.string().allow('', null),
  color: Joi.string().allow('', null),
  image: Joi.string().allow('', null),
});

/** After normalizeOrderAddress(), shape is fixed */
const normalizedAddressSchema = Joi.object({
  fullName: Joi.string().required(),
  phone: Joi.string().allow(''),
  line1: Joi.string().required(),
  line2: Joi.string().allow('', null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().pattern(/^[0-9]{5,6}$/).required(),
  country: Joi.string().default('India'),
}).required();

export const createOrderSchema = Joi.object({
  items: Joi.array().items(itemSchema).min(1).required(),
  totalAmount: Joi.number().positive().precision(2).required(),
  address: normalizedAddressSchema,
  paymentMethod: Joi.string().valid('cod', 'razorpay', 'upi', 'card').required(),
});

export const checkoutSchema = Joi.object({
  items: Joi.array().items(itemSchema).min(1).required(),
  address: Joi.object().unknown(true).required(),
  paymentMethod: Joi.string().valid('cod', 'razorpay', 'upi', 'card').required(),
  couponCode: Joi.string().allow('', null),
  walletAmount: Joi.number().min(0).default(0),
});

export const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});

export const cancelCheckoutSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
});

export const requestReturnSchema = Joi.object({
  reason: Joi.string().min(5).max(2000).required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending', 'confirmed', 'packed', 'shipped',
    'out_for_delivery', 'delivered', 'cancelled',
    'return_requested', 'returned', 'refunded'
  ).required(),
  trackingId: Joi.string().allow('', null),
  trackingUrl: Joi.string().uri().allow('', null),
  courierName: Joi.string().allow('', null),
  cancelReason: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
});
