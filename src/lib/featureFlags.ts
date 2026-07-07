// No real payouts/withdrawal endpoint yet — WithdrawDialog still fakes a
// completed bank transfer locally. Kept visible on purpose (product wants the
// UI shown even without the backend), so treat its "success" as cosmetic
// until a real endpoint backs it.
export const PAYOUTS_ENABLED = true

// No real customer-subscription lookup endpoint exists yet — flip this once
// the backend confirms one, to re-enable phone-based detection and "Bill to
// Subscription" on the create-order page.
export const SUBSCRIPTION_DETECTION_ENABLED = false
