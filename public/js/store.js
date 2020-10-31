function store() {
  const store = {};
  let state = {};

  const redrawThrottled = _.throttle(m.redraw, 500);

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
    redrawThrottled();
  };

  store.get = function (key, defaultValue) {
    return _.get(state, key, defaultValue);
  };

  store.persist = _.throttle(function () {
    window.localStorage.childrenAudioLibrary = JSON.stringify(state);
  }, 2000);

  return store;
}

export default store;
