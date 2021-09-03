class BaseWidget {
  constructor(wrapperElement, initialValue) {

    this.dom = {};
    this.dom.wrapper = wrapperElement;
    this.correctValue = initialValue;
  }

  get value() {
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value) {
    //assign this widget instance to local variable
    const thisWidget = this;
        
    //parse whatevr input to value
    let newValue = this.parseValue(value);
    
    //check whether value is the same or not a number
    if(newValue != thisWidget.dom.input.value && this.isValid(newValue) ) {
       
      //in case both conditions are negative assign passed value to current one
      thisWidget.correctValue = newValue;
      thisWidget.renderValue();
    }
    
    thisWidget.announce();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }
    
  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return true; 
  }

  renderValue() {
    const thisWidget = this;
        
    thisWidget.dom.input.value = thisWidget.correctValue;
  }
    
  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
        
    thisWidget.dom.wrapper.dispatchEvent(event);
  }

}
export default BaseWidget;