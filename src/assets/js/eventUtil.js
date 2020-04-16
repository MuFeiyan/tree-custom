const eventUtil = {
  getEvent(event) {
    if (event) {
      return event;
    } else {
      return window.event;
    }
  },
  preventDefault(event) {
    const e = this.getEvent(event);
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  },
  stopPropagation(event) {
    const e = this.getEvent(event);
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  },
};
export default eventUtil;
