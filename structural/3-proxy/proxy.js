// Для перехвату обєкта і маніпуляції до або після звернення
// наприклад авторизація - при переході на сайт перекидує на сторінку логіну
// і в залежності від статуса (авторизований чи ні) появляється повний доступ
// до ресурсу або обмежений

class CarAccess {
	open() {
		console.log('Opening car door')
	}

	close() {
		console.log('Closing the car door')
	}
};

class SecuritySystem {
	constructor(door) {
		this.door = door;
	}

	open(password) {
		if (this.authenticate(password)) {
			this.door.open();
		} else {
			console.log('Access denied!');
		}
	}

	authenticate(password) {
		return password === 'Ilon';
	}

	close() {
		this.door.close()
	}
};

const door = new SecuritySystem(new CarAccess());

door.open('Jack');
door.open('Ilon');
door.close();
