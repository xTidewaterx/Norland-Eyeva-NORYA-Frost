how to complete payment with stripe and next.js::




1:: use the stripe payments methods api api:: 
it allows you to accept payment methods::
combine a payment method with a paymentintent  api to accept payment::
how would that look::


1:: question how to accept a payment with stripe::

a paymentintent guides you through the process of collecting a apayment from your customer, presumably through its numerous endpoints, with cancel acpture and confirm, a paymentintent transitions through multiple statuses, it holds statuses relevant to wether or not hte payment is successful, we want a successful charge, stripe.js paymentintent, a paymentintent can create at most one successful charge, exmaple payymentintent status:: processing --- then ---- succeeded
succeeded status for paymentintent explained:: succeeded
A PaymentIntent with a status of succeeded means that the payment flow it is driving is complete.

The funds are now in your account and you can confidently fulfill the order. If you need to refund the customer, you can use the Refunds API., basically our paymentinents has many statuses and tracks wether or not the payment has suceeded, payment flow is then complete, funds are now in your account








extra note, create checkout session, then we find out if payment is successful, what are we paying for with checkout session? :: here we are creating the checkout session, we have paramters price in object for checkout session, pay price:: 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Your Product Name',
            },
            unit_amount: 1000, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
    });
    res.status(200).json({ id: session.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

2.3 Handling Successful Payments
When a payment is successful, Stripe will redirect the user back to the success_url specified in the Checkout session. You can create a new page in your Next.js application to handle successful payments.




























basically to create our payment with stripe, we create a checkout session on our backend next.js route,
on our app/api route, just do this::

const stripe = require('stripe')('sk_test_4S68v29DeKcE4RxJcrJnUn5s');

const session = await stripe.checkout.sessions.create({
  success_url: 'https://example.com/success',
  line_items: [
    {
      price: 'price_1MotwRLkdIwHu7ixYcPLm5uZ',
      quantity: 2,
    },
  ],
  mode: 'payment',
});



















link::
https://docs.stripe.com/payments


integrate payments with stripe api::

using next.js::
most popular is a stripe-hosted page::

1:: we create a stripe next.js route, on our app/api route we have create our checkout session. stripe.checkout.sessions.create({
    line_items: [ inside here you can include price id of the product you want to sell]
})\in our session we iinclude payment attribute success url
and cancel url, we import stripe like this:: import { stripe } from '../../../lib/stripe' --we created stripe with secret key as parameter in our file


1.1:: on our frontend, our client can now call our endpoint on app/api/checkout sessions route.js, then it can get the response that is our session url, it creates a session url, and then grab session id
:: we basically just have an app page, that on submit button redirects form action to our api checkout sessions method post, our stripe is exported by using export const stripe new stripe process stripe secret key

2:: it appears that as soon as our client requests somethign from our backend server stripe api, our server creates the stripe.checkout session with out stripe secret key, and we return       mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    });
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}

::: here we are completing a payment, because we have payment methods 

on client we wait until the payment succeeds, fulfill orders when payment succeeds, then hjandle redirect, message on client side, our client keeps making request to our next.js backend route 

parameter in the checkout object, next.js we have routes, and we have responses from our requests to our backend, client can get url from backend,  checkout object success cancel url Supply success and cancel URLs

settings
Specify URLs for success and cancel pages—make sure they’re publicly accessible so Stripe can redirect customers to them. You can also handle both the success and canceled states with the same URL.