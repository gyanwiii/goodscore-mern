const User = require("../models/User");
const { signToken } = require("../utils/token");
const { PLAN_PRICE } = require("../utils/constants");
const stripe = require("../config/stripe");

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const today = () => new Date().toISOString().slice(0, 10);

/**
 * The single place that actually turns a subscription "on". Called from
 * BOTH the webhook (the source of truth in production) and the /confirm
 * fallback endpoint (so activation still works in local dev or anywhere a
 * public webhook URL isn't reachable). Safe to call more than once for the
 * same session — it just re-applies the same values.
 */
async function activateSubscription(userId, { plan, charity, charityPercent, stripeCustomerId, stripeSubscriptionId }) {
  const user = await User.findById(userId);
  if (!user) return null;
  user.plan = plan;
  user.status = "active";
  user.renewalDate = addDays(today(), plan === "monthly" ? 30 : 365);
  user.charity = charity;
  user.charityPercent = Number(charityPercent);
  if (stripeCustomerId) user.stripeCustomerId = stripeCustomerId;
  if (stripeSubscriptionId) user.stripeSubscriptionId = stripeSubscriptionId;
  await user.save();
  return user;
}

// POST /api/subscriptions/checkout
// Creates (or reuses) the account, then creates a Stripe Checkout Session
// and hands back its URL. Nothing about the subscription is activated here —
// that only happens once Stripe confirms the payment (see confirmCheckout /
// stripeWebhook below).
async function createCheckoutSession(req, res, next) {
  try {
    const { plan, charity, charityPercent, name, email, password } = req.body;

    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ message: "Choose a monthly or yearly plan." });
    }
    if (!charity) return res.status(400).json({ message: "Choose a charity to support." });
    const pct = Number(charityPercent);
    if (!(pct >= 10 && pct <= 100)) {
      return res.status(400).json({ message: "Charity contribution must be between 10% and 100%." });
    }

    let user = req.user || null;
    if (!user) {
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required to subscribe." });
      }
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ message: "An account with that email already exists — log in instead." });
      user = await User.create({ name, email, password }); // status stays 'inactive' until payment confirms
    }

    const fee = PLAN_PRICE[plan];
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(fee * 100),
            recurring: { interval: plan === "monthly" ? "month" : "year" },
            product_data: { name: `GoodScore — ${plan} plan` },
          },
          quantity: 1,
        },
      ],
      // Only non-sensitive identifiers go in metadata — this is what the
      // webhook/confirm step reads back to know what to activate.
      metadata: { userId: String(user._id), plan, charity: String(charity), charityPercent: String(pct) },
      success_url: `${process.env.CLIENT_ORIGIN}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_ORIGIN}/subscribe?canceled=1`,
    });

    // Log the user in now so the session survives the redirect to Stripe and
    // back — their plan just isn't "active" until payment is confirmed.
    const token = signToken(user);
    res.json({ checkoutUrl: session.url, token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/subscriptions/confirm  { sessionId }
// Called by the frontend's success page right after Stripe redirects back.
// Verifies payment status directly against Stripe's API (never trusts the
// redirect alone) before activating anything. This is a safety-net path —
// the webhook below is the mechanism Stripe itself recommends relying on.
async function confirmCheckout(req, res, next) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Missing session id." });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(402).json({ message: "Payment not completed yet — if you just paid, wait a moment and try again." });
    }
    if (String(session.metadata.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "This checkout session doesn't belong to your account." });
    }

    const user = await activateSubscription(session.metadata.userId, {
      plan: session.metadata.plan,
      charity: session.metadata.charity,
      charityPercent: session.metadata.charityPercent,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
    });
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/subscriptions/webhook  — mounted separately in app.js with a raw
// body parser (Stripe's signature check needs the exact raw bytes). This is
// the production source of truth: Stripe calls this directly, so activation
// doesn't depend on the customer's browser making it back to your site.
async function stripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.metadata?.userId) {
      try {
        await activateSubscription(session.metadata.userId, {
          plan: session.metadata.plan,
          charity: session.metadata.charity,
          charityPercent: session.metadata.charityPercent,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        });
      } catch (err) {
        console.error("Failed to activate subscription from webhook:", err);
      }
    }
  }

  res.json({ received: true });
}

// PUT /api/subscriptions/me/charity  — changing WHERE the money goes needs
// no payment, so this is untouched by the Stripe flow.
async function updateCharity(req, res, next) {
  try {
    const { charity, charityPercent } = req.body;
    const pct = Number(charityPercent);
    if (!(pct >= 10 && pct <= 100)) {
      return res.status(400).json({ message: "Charity contribution must be between 10% and 100%." });
    }
    req.user.charity = charity;
    req.user.charityPercent = pct;
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/subscriptions/me — cancels the real Stripe subscription too,
// not just the local flag, so the customer actually stops being billed.
async function cancel(req, res, next) {
  try {
    if (req.user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(req.user.stripeSubscriptionId);
      } catch (err) {
        console.warn("Stripe subscription cancel warning:", err.message);
      }
    }
    req.user.status = "inactive";
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { createCheckoutSession, confirmCheckout, stripeWebhook, updateCharity, cancel };
