// Розділяє один або кілька класів на кілька окремих ієрархій
// (абстракція і реалізація), що дозволяє їх змінювати без їх залежності
// одне від одного

class Model {
	constructor(color) {
		this.color = color;
	}
};

class Color {
	constructor(type) {
		this.type = type;
	}
	get() {
		return this.type;
	}
};

class BlackColor extends Color {
	constructor() {
		super("dark-black");
	}
}

class SilbrigColor extends Color {
	constructor() {
		super("Silbermetallic");
	}
}

class Audi extends Model {
	constructor(color) {
		super(color);
	}

	paint() {
		return `Auto: Audi, Color: ${this.color.get()}`;
	}
};

class Bmw extends Model {
	constructor(color) {
		super(color);
	}

	paint() {
		return `Auto: Bmw, Color: ${this.color.get()}`;
	}
};


const blackBmw = new Bmw(new BlackColor());

console.log(blackBmw.paint());
