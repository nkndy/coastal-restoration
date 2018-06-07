// prod_CztMufIXQeU4RG Coastal warrior program
module.exports = function(ctx, callback) {
var stripe = require('stripe@6.0.0')(ctx.secrets.STRIPE_SK_TEST);
var postmark = require("postmark@1.6.1");
// get correct plan id
switch (ctx.body['metadata[plan]']) {
    case 'Coastal Warrior':
        plan = "plan_CztNvasFByFEtE";
        break;
    default: 
        plan = "no_plan";
}

// Create a new customer and then a new charge for that customer:
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
  // New subscription created on a new customer
  console.log("did it")
  // Send an email:
  var client = new postmark.Client("0a071725-2b2e-4afd-9fde-88c913798371");
  client.sendEmailWithTemplate({
    "From": "sender@example.com",
    "To": "recipient@example.com",
    "TemplateId": 6826302,
    "TemplateModel": {
      "product_name": "product_name_Value",
      "name": "name_Value",
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
  });
}).catch(function(err) {
  callback(err);
  // Deal with an error
});
}

/////////////// V3 /////////////
// module.exports = function(ctx, callback) {
// var stripe = require('stripe@6.0.0')(ctx.secrets.STRIPE_SK_TEST);
// // Create a new customer and then a new charge for that customer:
// stripe.customers.create({
//   email: ctx.body.email,
//   metadata: {
//       'name': ctx.body['metadata[name]'],
//       'company_name': ctx.body['metadata[company_name]'],
//       'phone': ctx.body['metadata[phone]']
//   }
// }).then(function(customer){
//   return stripe.customers.createSource(customer.id, {
//     source: ctx.body['stripeToken[id]']
//   });
// }).then(function(source) {
//   return stripe.charges.create({
//     amount: 1900,
//     currency: 'cad',
//     customer: source.customer
//   }, callback);
// }).then(function(charge) {
//   // New charge created on a new customer
//   console.log("did it")
// }).catch(function(err) {
//   callback(err);
//   // Deal with an error
// });
// }