import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';


class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this; //sd

    thisWidget.getElements(element);
    thisWidget.initActions(thisWidget);
    thisWidget.setValue(settings.amountWidget.defaultValue);

    // console.log('thisWidget', thisWidget);
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  isValid(value) {
    const min = settings.amountWidget.defaultMin;
    const max = settings.amountWidget.defaultMax;
    return (value >= min && value <= max && !isNaN(value));
  }

  initActions(thisWidget) {

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.value(thisWidget.dom.input.value);
    });
    //this.setValue(this.input)

    thisWidget.dom.linkIncrease.addEventListener('click', function() {
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) + 1);
      // console.log('click works');
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function() {
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) - 1);
      // console.log('click works');
    });
  }
}

export default AmountWidget;