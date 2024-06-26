// Для копіювання обєктів не вдаючись до подробиць їх реалізації
// клони потрібні для того щоб змінити їх структуру

class TeslaCar {

	constructor(model, price, interior, autopilot) {
		this.model = model;
		this.price = price;
		this.interior = interior;
		this.autopilot = autopilot;
	}

	produce() {
		return new TeslaCar(this.model, this.price, this.interior, this.autopilot);
	}
}

const prototypeCar = new TeslaCar('S', 90000, 'white', false);

const car1 = prototypeCar.produce();
const car2 = prototypeCar.produce();
const car3 = prototypeCar.produce();

car1.interior = 'black';
car1.autopilot = true;

console.log(car1)
console.log(car2)
console.log(car3)
