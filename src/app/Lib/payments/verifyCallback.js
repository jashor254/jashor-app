export function verifyCallback(callbackBody) {
  const stk = callbackBody?.Body?.stkCallback;

  if (!stk) return null;

  return {
    success: stk.ResultCode === 0,
    merchantRequestId: stk.MerchantRequestID,
    checkoutRequestId: stk.CheckoutRequestID,
    receipt:
      stk.CallbackMetadata?.Item?.find(i => i.Name === "MpesaReceiptNumber")
        ?.Value || null
  };
}
