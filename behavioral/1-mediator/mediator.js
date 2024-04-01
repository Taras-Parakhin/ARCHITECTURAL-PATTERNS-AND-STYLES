
// Для зменшення звязаності класів між собою і встановлення всіх
// необхідних звязків тільки всередині себе

class OfficialDealer {
  constructor() {
    this.customers = [];
  }

  orderAuto(customer, auto, info) {
    const name = customer.getName();
    console.log(`Order name: ${name}. Order auto is ${auto}`);
    console.log(`Additional info: ${info}`);
    this.addToCustomersList(name);
  }

  addToCustomersList(name) {
    this.customers.push(name);
  }

  getCustomerList() {
    return this.customers;
  }
};

class Customer {
  constructor(name, dealerMediator) {
    this.name = name;
    this.dealerMediator = dealerMediator;
  }

  getName() {
    return this.name;
  }

  makeOrder(auto, info) {
    this.dealerMediator.orderAuto(this, auto, info)
  }
};


const mediator = new OfficialDealer();

const ivan = new Customer('Ivan', mediator);
const sara = new Customer('Sara', mediator);

ivan.makeOrder('BMW', 'With autopilot');
sara.makeOrder('Audi', 'With parktronik');

console.log(mediator.getCustomerList())
