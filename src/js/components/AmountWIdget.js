import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';


class AmountWidget extends BaseWidget{
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

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
    
<<<<<<< HEAD
    thisWidget.dom.input.value = thisWidget.value;
=======
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
      
>>>>>>> ef31d17aaf4bc2f0ce79ac86b1dd1b13a2c993df
  }

  isValid(value){
    const min = settings.amountWidget.defaultMin;
    const max = settings.amountWidget.defaultMax;
    return (value >= min && value <= max && !isNaN(value)); 
  }
  
  initActions(thisWidget){

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.value(thisWidget.dom.input.value);
    }); 
    //this.setValue(this.input)
    
    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      thisWidget.setValue(parseInt(thisWidget.dom.input.value)+1);
      // console.log('click works');
    });
    thisWidget.dom.linkDecrease.addEventListener('click',  function(){
      thisWidget.setValue(parseInt(thisWidget.dom.input.value)-1);
      // console.log('click works');
    });
  }
}

export default AmountWidget;