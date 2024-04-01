// Для приховування складну логіку за простим фасадом
// (зібрати різні складні структури обєднати їх
// і видавати наверх зрозумілий інтерфейс взаємодії)

class Conveyor {

	setBody() {
		console.log('Body set!');
	}

	getEngine() {
	  console.log('Dismantle Engine!');
  }

	setEngine() {
		console.log('Engine set!');
	}

	setInterior() {
		console.log('Exterior added!');
	}

	getInterior() {
		console.log('Dismantle interior!');
	}

	setExterior() {
		console.log('Added interior!');
	}

	setWheels() {
		console.log('Wheels!');
	}

	addElectronics() {
		console.log('Added electronics!');
	}

	paint() {
		console.log('Car painted!');
	}
}

class ConveyorFacade {
	constructor(car) {
		this.car = car;
	}

	assembleCar() {
		this.car.setBody();
		this.car.setEngine();
		this.car.setInterior();
		this.car.setExterior();
		this.car.setWheels();
		this.car.addElectronics();
		this.car.paint();
	}

	changeEngine() {
		this.car.getEngine();
		this.car.setEngine();
	}

	changeInterior() {
		this.car.getInterior();
		this.car.setInterior();
	}
}

const conveyor = new ConveyorFacade(new Conveyor());

const car = conveyor.assembleCar();

console.log(car);
