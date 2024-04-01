
// Для економії памяті, зайнятої обєктами, якщо обєкт ще не створений,
//  то він створюється, поміщає його в свій внутрішній пул
//  і повератає ссилку на нього, якщо такий обєкт вже існує,
//  то просто повертається ссилка на нього

class Auto {
	constructor(model) {
		this.model = model;
	}
}

class AutoFactory {
	constructor(name) {
		this.models = {};
	}

	create(name) {
		let model = this.models[name];
		if (model) return model;
		console.count('model');
		this.models[name] = new Auto(name);
		return this.models[name];
	}

	getModels() {
    console.log(this.models);
  }
};

const factory = new AutoFactory();

const bmw = factory.create('BMW');
const audi = factory.create('Audi');
const tesla = factory.create('Tesla');
const blackTesla = factory.create('Tesla');

console.log(factory.getModels());
