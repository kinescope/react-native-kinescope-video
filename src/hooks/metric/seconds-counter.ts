type OnSecondsCounterChange = (data: {value: number; total: number}) => void;

export class SecondsCounter {
	seconds = new Set();
	handleChange?: OnSecondsCounterChange;

	push = (currentTime: number) => {
		const second = Math.floor(currentTime);
		if (!this.seconds.has(second)) {
			this.seconds.add(second);
		}
		if (this.handleChange) {
			this.handleChange({value: second, total: this.seconds.size});
		}
	};

	getTotal = () => {
		return this.seconds.size;
	};

	setChange = (callback?: OnSecondsCounterChange) => {
		this.handleChange = callback;
	};

	reset = () => {
		this.seconds.clear();
		this.handleChange = undefined;
	};
}
