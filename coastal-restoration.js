module.exports = function(ctx, callback) {
var stripe = require('stripe@6.0.0')(ctx.secrets.STRIPE_SK_TEST);
var postmark = require("postmark@1.6.1");

// console.log(ctx.body['metadata[subscriptionType]'])
// console.log(ctx.body['metadata[plan]'])

var client = new postmark.Client("0a071725-2b2e-4afd-9fde-88c913798371");

//get one time amount
switch (ctx.body['metadata[plan]']) {
  case 'The Coastal Ambassador Program':
      amount = 50000;
      break;
  default: 
      amount = 50000;
}
// get subscription id
switch (ctx.body['metadata[plan]']) {
    case 'The Coastal Ambassador Program':
        plan = "plan_D8uyHuB1TW2dwB";
        break;
    default: 
        plan = "no_plan";
}

// setup email function

// if one time donation create charge
if (ctx.body['metadata[subscriptionType]'] == "OneTime") {
stripe.customers.create({
  email: ctx.body.email,
  metadata: {
      'name': ctx.body['metadata[name]'],
      'company_name': ctx.body['metadata[company_name]'],
      'phone': ctx.body['metadata[phone]'],
  },
  source: ctx.body['stripeToken[id]']
}).then(function(customer){
  return stripe.charges.create({
    amount: amount,
    currency: "cad",
    customer: customer.id
  }, callback);
}).then(function(charge) {
  sendEmail();
}).catch(function(err) {
  callback(err);
  // Deal with an error
});
}

// If subscription is annual
// Create a new customer and then a new charge for that customer:
if (ctx.body['metadata[subscriptionType]'] == "Annual") {
stripe.customers.create({
  email: ctx.body.email,
  metadata: {
      'name': ctx.body['metadata[name]'],
      'company_name': ctx.body['metadata[company_name]'],
      'phone': ctx.body['metadata[phone]']
  }
}).then(function(customer){
  return stripe.customers.createSource(customer.id, {
    source: ctx.body['stripeToken[id]']
  });
}).then(function(source) {
  return stripe.subscriptions.create({
    customer: source.customer,
    items: [
    {
      plan: plan,
    },
  ]
  }, callback);
}).then(function(subscription) {
  console.log("email")
  client.sendEmailWithTemplate({
    "From": "info@coastrestore.com",
    "To": ctx.body.email,
    "TemplateId": 6826302,
    "TemplateModel": {
      "product_name": "product_name_Value",
      "name": ctx.body['metadata[name]',
      "product_url": "product_url_Value",
      "action_url": "action_url_Value",
      "login_url": "login_url_Value",
      "username": "username_Value",
      "trial_length": "trial_length_Value",
      "trial_start_date": "trial_start_date_Value",
      "trial_end_date": "trial_end_date_Value",
      "support_email": "support_email_Value",
      "live_chat_url": "live_chat_url_Value",
      "sender_name": "sender_name_Value",
      "help_url": "help_url_Value",
      "company_name": "company_name_Value",
      "company_address": "company_address_Value"
    }
  }, function(error, result) {
    if(error) {
        console.error("Unable to send via postmark: " + error.message);
        return;
    }
    console.info("Sent to postmark for delivery")
  });
}).catch(function(err) {
  callback(err);
  // Deal with an error
});
}
};