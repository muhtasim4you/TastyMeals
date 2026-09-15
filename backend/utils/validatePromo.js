const Order = require("../models/Order");

// preDiscountTotal is what the discount is computed against (subtotal + delivery + tax),
// matching how the points-redemption discount is applied at checkout.
const validatePromo = async (promoCode, userId, subtotal, preDiscountTotal) => {
  if (!promoCode.active) {
    throw new Error("This promo code is no longer active");
  }
  if (promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date()) {
    throw new Error("This promo code has expired");
  }
  if (subtotal < promoCode.minOrderValue) {
    throw new Error(`This code requires a minimum order of ৳${promoCode.minOrderValue}`);
  }
  if (promoCode.usageLimit !== null && promoCode.usedCount >= promoCode.usageLimit) {
    throw new Error("This promo code has reached its usage limit");
  }

  const userUsageCount = await Order.countDocuments({ user: userId, promoCode: promoCode.code });
  if (userUsageCount >= promoCode.usageLimitPerUser) {
    throw new Error("You have already used this promo code");
  }

  let discount =
    promoCode.discountType === "percentage"
      ? (preDiscountTotal * promoCode.discountValue) / 100
      : promoCode.discountValue;

  if (promoCode.discountType === "percentage" && promoCode.maxDiscount) {
    discount = Math.min(discount, promoCode.maxDiscount);
  }
  discount = Math.min(discount, preDiscountTotal);

  return { discount: Math.round(discount * 100) / 100 };
};

module.exports = validatePromo;
