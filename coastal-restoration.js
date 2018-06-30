module.exports = function(ctx, callback) {
var stripe = require('stripe@6.0.0')(ctx.secrets.STRIPE_SK_TEST);
var postmark = require("postmark@1.6.1");

console.log(ctx.body['metadata[subscriptionType]'])
console.log(ctx.body['metadata[plan]'])

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
  sendEmail();
}).catch(function(err) {
  callback(err);
  // Deal with an error
});
}
};