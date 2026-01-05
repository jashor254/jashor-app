// src/lib/payments/walletService.js

import { supabase } from '@/utils/supabaseClient';

/**
 * Applies a confirmed Mpesa payment safely
 */
export async function applyPayment({
  schemeId = null,
  userId = null,
  amount,
  receipt,
  phone,
}) {
  if (!receipt || !amount) {
    throw new Error('Invalid payment data');
  }

  // 1️⃣ Prevent duplicate processing
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('receipt', receipt)
    .single();

  if (existing) {
    // Already processed — SAFE EXIT
    return { status: 'DUPLICATE' };
  }

  // 2️⃣ Record payment first (single source of truth)
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      scheme_id: schemeId,
      user_id: userId,
      amount,
      receipt,
      phone,
      status: 'CONFIRMED'
    });

  if (paymentError) {
    throw paymentError;
  }

  // 3️⃣ Scheme payment
  if (schemeId) {
    const { error: schemeError } = await supabase
      .from('schemes')
      .update({
        status: 'PAID',
        paid_at: new Date().toISOString(),
        amount,
        payment_ref: receipt
      })
      .eq('id', schemeId)
      .neq('status', 'PAID');

    if (schemeError) {
      throw schemeError;
    }

    return { status: 'SCHEME_PAID' };
  }

  // 4️⃣ Wallet top-up
  if (userId) {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const newBalance = (wallet?.balance || 0) + amount;

    const { error: walletError } = await supabase
      .from('wallets')
      .upsert({
        user_id: userId,
        balance: newBalance,
        updated_at: new Date().toISOString()
      });

    if (walletError) {
      throw walletError;
    }

    return { status: 'WALLET_FUNDED', balance: newBalance };
  }

  return { status: 'NO_ACTION' };
}
