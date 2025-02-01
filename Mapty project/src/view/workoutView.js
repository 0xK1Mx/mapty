class workoutView {
  #parentEl = document.querySelector('.workouts');
  #formEl = document.querySelector('.form');
  #inputType = document.querySelector('.form__input--type');
  #inputDistance = document.querySelector('.form__input--distance');
  #inputDuration = document.querySelector('.form__input--duration');
  #inputCadence = document.querySelector('.form__input--cadence');
  #inputElevation = document.querySelector('.form__input--elevation');
  _data;

  render(data) {
    this._data = data;
    const markup = this._generateMarkup();
    this.#parentEl.insertAdjacentHTML('beforeend', markup);
  }

  addHandlerDeleteWorkout(handler) {
    this.#parentEl.addEventListener('click', function (e) {
      const deleteBtn = e.target.closest('.delete_btn');
      if (!deleteBtn) return; // Only proceed if the click was on a delete button

      handler(e);
    });
  }

  addHandlerNewWorkout(handler) {
    this.#formEl.addEventListener('submit', handler);
  }

  addHandlerChangeType(handler) {
    this.#inputType.addEventListener('change', handler);
  }

  addHandlerMoveTo(handler) {
    this.#parentEl.addEventListener('click', handler);
  }

  // Get form input values
  getFormValues() {
    return {
      type: this.#inputType.value,
      distance: +this.#inputDistance.value,
      duration: +this.#inputDuration.value,
      cadence: +this.#inputCadence.value,
      elevation: +this.#inputElevation.value,
    };
  }

  showForm(mapEvent) {
    this.#formEl.classList.remove('hidden');
    const { lat, lng } = mapEvent.latlng; // Use the passed mapEvent
  }
  hideForm() {
    this.#formEl.classList.add('hidden');
  }

  resetForm() {
    this.#inputDistance.value = '';
    this.#inputDuration.value = '';
    this.#inputCadence.value = '';
    this.#inputElevation.value = '';
  }

  _generateMarkup() {
    let html = `
    <li class="workout workout--${this._data.type}" data-id="${this._data.id}">
      <h2 class="workout__title">${this._data.description}</h2>
      <button class="delete_btn">Delete 🗑️</button>
      <div class="workout__details">
        <span class="workout__icon">${
          this._data.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${this._data.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${this._data.duration}</span>
        <span class="workout__unit">min</span>
      </div>
  `;

    if (this._data.type === 'running')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${this._data.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${this._data.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
    `;

    if (this._data.type === 'cycling')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${this._data.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${this._data.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
    `;
    return html;
  }
}

export default new workoutView();
