const { createMollieClient } = require('@mollie/api-client');
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_KEY });

class MollieController {

  /** 01. Create payment */
    createPayment = async (req, res, next) => {
        await mollieClient.payments.create({
            amount: {
              currency: 'EUR',
              value: req.body.price, // We enforce the correct number of decimals through strings
            },
            description: 'New order',
            redirectUrl: `${process.env.APP_URL}/order`,
            method: req.body.method,
            webhookUrl: `${process.env.API_URL}/api/mollie/webhook`,
        })
        .then(payment => res.status(201).send(payment.getCheckoutUrl()))
        .catch(err => res.status(401).json(err));
    }

    /** 02. Create order */
    createOrder = async (req, res, next) => {
        await mollieClient.orders.create({
            amount: {
              value: req.body.amount.value,
              currency: req.body.amount.currency,
            },
            billingAddress: {
            //   organizationName: 'Mollie B.V.',
              streetAndNumber: req.body.billingAddress.streetAndNumber,
              city: req.body.billingAddress.city,
              region: req.body.billingAddress.region,
              postalCode: req.body.billingAddress.postalCode,
              country: req.body.billingAddress.country,
            //   title: 'Dhr.',
              givenName: req.body.billingAddress.givenName,
              familyName: req.body.billingAddress.familyName,
              email: req.body.billingAddress.email,
              phone: req.body.billingAddress.phone,
            },
            shippingAddress: {
            //   organizationName: 'Mollie B.V.',
              streetAndNumber: req.body.shippingAddress.streetAndNumber,
              city: req.body.shippingAddress.city,
              region: req.body.shippingAddress.region,
              postalCode: req.body.shippingAddress.postalCode,
              country: req.body.shippingAddress.country,
            //   title: 'Mr.',
            givenName: req.body.shippingAddress.givenName,
              familyName: req.body.shippingAddress.familyName,
              email: req.body.shippingAddress.email,
            },
            locale: 'nl_NL',
            orderNumber: req.body.orderNumber,
            redirectUrl: `${process.env.APP_URL}/order`,
            method: req.body.method,
            lines: req.body.lines,
            webhookUrl: `${process.env.API_URL}/api/mollie/webhook`,
          })
        // .then(order => res.send(order.getCheckoutUrl()))
        .then(order => res.status(201).send(order.getCheckoutUrl()))
        .catch(err => res.json(err));
    }

    /** 03. Setup a webhook route */
    webhook = async (req, res, next) => {
      try {
        // Get current payment
        const payment = await mollieClient.payments.get(req.body.id);

        // 
        const isPaid = payment.status === 'paid';

        // Check if payment is paid
        if(isPaid) {
          // If paid, log id and send payment
          console.log(`Payment is paid with id: + ${payment.id}`);
          res.status(201).send(payment);
        } else {
          // If not paid, log & send status
          console.log(`Payment status: ${payment.status}`);
        }
      } catch (err) {
        // If an error occures, log the error message
        console.log(err.message)
      }
    };
    
}

module.exports = MollieController;