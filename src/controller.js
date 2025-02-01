import { Running, Workout, Cycling } from './model.js';
import workoutView from './view/workoutView.js';
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

///////////////////////////////////////
// APPLICATION ARCHITECTURE

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._setMapEvent.bind(this)); // Set map event here

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  // Store map event
  _setMapEvent(mapE) {
    this.#mapEvent = mapE; // Save map event to the App class
    workoutView.showForm(mapE); // Trigger the form showing from the workoutView
  }

  // _showForm(mapE) {
  // this.#mapEvent = mapE;
  //   form.classList.remove('hidden');
  //   inputDistance.focus();
  // }

  // _hideForm() {
  //   // Empty inputs
  //   inputDistance.value =
  //     inputDuration.value =
  //     inputCadence.value =
  //     inputElevation.value =
  //       '';

  //   form.style.display = 'none';
  //   form.classList.add('hidden');
  //   setTimeout(() => (form.style.display = 'grid'), 1000);
  // }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // // Get data from form
    // const type = inputType.value;
    // const distance = +inputDistance.value;
    // const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    const values = workoutView.getFormValues();

    // If workout running, create running object
    if (values.type === 'running') {
      const cadence = values.cadence;

      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(values.distance, values.duration, values.cadence) ||
        !allPositive(values.distance, values.duration, values.cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running(
        [lat, lng],
        values.distance,
        values.duration,
        cadence
      );
    }

    // If workout cycling, create cycling object
    if (values.type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(values.distance, values.duration, elevation) ||
        !allPositive(values.distance, values.duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling(
        [lat, lng],
        values.distance,
        values.duration,
        elevation
      );
    }
    this.#workouts.push(workout);

    // Add new object to workout array

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input fields
    workoutView.hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();

    workoutView.resetForm();
  }

  _renderWorkoutMarker(workout) {
    workout.marker = L.marker(workout.coords).addTo(this.#map);

    workout.marker
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _deleteWorkout(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workoutIndexToDelete = this.#workouts.findIndex(
      work => work.id === workoutEl.dataset.id
    );

    if (workoutIndexToDelete === -1) return;

    const workout = this.#workouts[workoutIndexToDelete];

    // Remove marker from the map
    if (workout.marker) {
      this.#map.removeLayer(workout.marker);
    }
    //update arr
    this.#workouts.splice(workoutIndexToDelete, 1);

    this._setLocalStorage();
    //remove the element from the dom
    workoutEl.remove();
    // containerWorkouts.remove(workoutEl);
  }

  _renderWorkout(workout) {
    workoutView.render(workout);
  }

  _moveToPopup(e) {
    // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
    if (!this.#map) return;

    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    if (!workout) return;

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public interface
    // workout.click();
  }

  _setLocalStorage() {
    // Create a shallow copy of the workouts array without the map object
    const workoutsData = this.#workouts.map(workout => {
      const { marker, ...workoutData } = workout; // Remove marker if it exists
      return workoutData;
    });

    localStorage.setItem('workouts', JSON.stringify(workoutsData));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

const init = function () {
  workoutView.addHandlerDeleteWorkout(app._deleteWorkout.bind(app));
  workoutView.addHandlerChangeType(app._toggleElevationField);
  workoutView.addHandlerMoveTo(app._moveToPopup.bind(app));
  workoutView.addHandlerNewWorkout(app._newWorkout.bind(app));
};

init();
