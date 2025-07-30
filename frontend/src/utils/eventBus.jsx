const eventBus = {
    events: {},
    on(eventName, callback) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      this.events[eventName].push(callback);
    },
    emit(eventName, data) {
      if (this.events[eventName]) {
        this.events[eventName].forEach(callback => callback(data));
      }
    },
  };
export default  eventBus 
