function store() {
  const store = {};
  let state = {};

  const redrawDebounced = _.debounce(m.redraw.bind(m), 500);

  try {
    state = JSON.parse(window.localStorage['childrenAudioLibrary']);
  } catch (err) {
    console.warn('Unable to get state from localStorage');
    state = {};
  }

  store.set = function (key, value) {
    typeof key === 'string'
      ? state[key] = value
      : _.assign(state, key);
    store.persist();
    redrawDebounced();
  };

  store.get = function (key, defaultValue) {
    return _.get(state, key, defaultValue);
  };

  store.persist = _.debounce(function () {
    window.localStorage.childrenAudioLibrary = JSON.stringify(state);
  }, 2000);

  return store;
}
