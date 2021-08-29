import { select, templates } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWIdget.js";

class Booking {
    constructor(bookingElement) {
        this.render(bookingElement);
        this.initWidgets();
    }
    
    render(element) {
        //generate HTML with handlebars compiler method
        const generatedHTML = templates.bookingWidget();

        // generate DOM with utils functionality
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);

        //create empty object this.dom
        this.dom = {};

        //assign this.dom.wrapper to passed element
        this.dom.wrapper = element;

        //append DOM element to wrapper
        this.dom.wrapper.appendChild(generatedDOM);

        
        //PEOPLE AND HOURS AMOUNT FUNCTIONALITIES
        // get people amount wrapper
        this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount); 

        //get hoursAmount wrapper
        this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);


    }
      //create a increase/decrease amount functionality in cart
      initWidgets() {
        
        //create new AmountWidget instance
        this.hoursAmountWidget = new AmountWidget(this.dom.peopleAmount);
        this.peopleAmountWidget = new AmountWidget(this.dom.hoursAmount);

        //corrent the initial value in above created, AmountWidget instance.
        // thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
        
        //assign event listener to amount widget
        this.dom.hoursAmount.addEventListener('updated',function() {console.log('haw works!');});
        this.dom.peopleAmount.addEventListener('updated',function() {console.log('paw works!');});
    }
}

export default Booking