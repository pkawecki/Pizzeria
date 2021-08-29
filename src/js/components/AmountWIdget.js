import {select, settings} from '../settings.js';


class AmountWidget {
  constructor(element) {

    const thisWidget = this;

    thisWidget.getElements(element);
      
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions(thisWidget);
      
  }
  getElements(element) {
    const thisWidget = this;

    this.element = element;
    this.input = thisWidget.element.querySelector(select.widgets.amount.input);
    this.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    this.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    this.value = thisWidget.input.value; //to check
      
  }

  setValue(value) {
    const thisWidget = this;
    
    //parse whatevr input to value
    let newValue = parseInt(value);

    if (newValue > 9) {
      newValue = 9;
    }
    if(newValue < 1) {
      newValue = 1;
    }


    //check whether value is the same or not a number
    if(newValue != thisWidget.input.value && !isNaN(newValue)) {
        
      //in case both conditions are negative assign passed value to current one
      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
    }
  
    thisWidget.announce();
      
  }

  initActions(thisWidget){
    thisWidget.input.addEventListener('change', function() {thisWidget.setValue(thisWidget.input.value) ; }); //this.setValue(this.input)
    thisWidget.linkIncrease.addEventListener('click', function(){thisWidget.setValue(parseInt(thisWidget.input.value)+1);});
    thisWidget.linkDecrease.addEventListener('click',  function(){thisWidget.setValue(parseInt(thisWidget.input.value)-1);});
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
      
    thisWidget.element.dispatchEvent(event);
  
  }
}

export default AmountWidget;