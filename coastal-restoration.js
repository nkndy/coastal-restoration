module.exports = function(ctx, callback) {
var stripe = require('stripe@6.0.0')(ctx.secrets.STRIPE_SK_LIVE);
var postmark = require("postmark@1.6.1");

console.log(ctx.body['metadata[subscriptionType]'])
// console.log(ctx.body['metadata[plan]'])
// console.log(ctx.body)

var client = new postmark.Client("0a071725-2b2e-4afd-9fde-88c913798371");

//get one time amount
switch (ctx.body['metadata[plan]']) {
  case 'Coastal Ambassador':
      amount = 50000;
      break;
  case 'Salmon School':
      amount = 150000;
      break;
  case 'Wolf Pack':
      amount = 500000;
      break;
  case 'Orca Pod':
      amount = 2500000;
      break;      
  default: 
      amount = 50000;
}
// get subscription id
function getPlan(plan) {
  console.log('plan');
  switch (plan) {
      case 'Coastal Ambassador':
          return "plan_D8uyHuB1TW2dwB";
          break;
      case 'Salmon School':
        return "plan_D8uzpBBuQSVhXu";
        break;
      case 'Wolf Pack':
        return "plan_D8v0F5EVDGA9qY";
        break;
      case 'Orca Pod':
        return "plan_D8v09mWfR61P9d";
        break;                
      default: 
          return "plan_D8uyHuB1TW2dwB";
  }
}

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
  console.log("email")
  client.sendEmailWithTemplate({
    "From": "info@coastrestore.com",
    "To": ctx.body.email,
    "TemplateId": 6826302,
    "TemplateModel": {
      "product_name": "The Clayoquot Cleanup",
      "name": ctx.body['metadata[name]'],
      "support_email": "info@coastrestore.com",
      "sender_name": "Josh Temple",
      "trial_length": ctx.body['metadata[subscriptionType]'],
      "username": ctx.body['metadata[plan]'],
      "help_url": "https://www.clayoquotcleanup.com/",
      "product_url": "https://www.clayoquotcleanup.com/",
      "company_name": "Clayoquot Cleanup",
      "company_address": "Tofino, BC"
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

// If subscription is annual
// Create a new customer and then a new charge for that customer:
if (ctx.body['metadata[subscriptionType]'] == "Annual") {
  console.log("annual")
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
      plan: getPlan(ctx.body['metadata[plan]']),
    }
  ]
  }, callback);
}).then(function(subscription) {
  console.log("email")
  client.sendEmailWithTemplate({
    "From": "info@coastrestore.com",
    "To": ctx.body.email,
    "TemplateId": 6826302,
    "TemplateModel": {
      "product_name": "The Clayoquot Cleanup",
      "name": ctx.body['metadata[name]'],
      "support_email": "info@coastrestore.com",
      "sender_name": "Josh Temple",
      "trial_length": ctx.body['metadata[subscriptionType]'],
      "username": ctx.body['metadata[plan]'],
      "help_url": "https://www.clayoquotcleanup.com/",
      "product_url": "https://www.clayoquotcleanup.com/",
      "company_name": "Clayoquot Cleanup",
      "company_address": "Tofino, BC"
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