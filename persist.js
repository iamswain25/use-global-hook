function useCustom(React) {
  const newListener = React.useState()[1];
  React.useEffect(() => {
    this.listeners.push(newListener);
    return () => {
      this.listeners = this.listeners.filter(
        listener => listener !== newListener
      );
    };
  }, []);
  return [this.state, this.actions];
}

function associateActions(store, actions) {
  const associatedActions = {};
  Object.keys(actions).forEach(key => {
    if (typeof actions[key] === "function") {
      associatedActions[key] = actions[key].bind(null, store);
    }
    if (typeof actions[key] === "object") {
      associatedActions[key] = associateActions(store, actions[key]);
    }
  });
  return associatedActions;
}

export const usePersist = (key, React, initialState, actions, initializer) => {
  if (typeof key !== "string") {
    console.error("must have key as string value");
  }
  if (!window || !window.localStorage) {
    console.error("localStorage doens't exist in your environment");
  }
  const local = window.localStorage.getItem(key);
  const store = {
    state: local ? JSON.parse(local) : initialState,
    listeners: [],
    key,
    setState,
    actions
  };
  store.setState = setPersistState.bind(store);
  store.actions = associateActions(store, actions);
  if (initializer) initializer(store);
  return useCustom.bind(store, React);
};

function setPersistState(newState) {
  this.state = { ...this.state, ...newState };
  window.localStorage.setItem(this.key, JSON.stringify(this.state));
  this.listeners.forEach(listener => {
    listener(this.state);
  });
}

export default usePersist;
