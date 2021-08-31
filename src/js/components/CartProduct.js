import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';


class CartProduct {
  constructor(menuProduct, element) {
    //assign new name for instance
    const thisCartProduct = this;

    // console.log('menuProduct: ', menuProduct);
    // console.log('element: ', element);
      
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.params = menuProduct.params;
      
      
    //run getElements() method
    thisCartProduct.getElements(element);

    //run eventListener start-up and instatiate AmountWidget in Cart wrapper
    thisCartProduct.initCartAmountWidget();

    //activate initActions method - assign event listeners to EDIT and REMOVE buttons
    thisCartProduct.initActions();

      
  }

  initActions() {

    const thisCartProduct = this;

    //assign event listeneres to REMOVE and EDIT buttons
    this.dom.edit.addEventListener('click', function() {console.log('edited');});
    this.dom.remove.addEventListener('click', function() {console.log('removed'); thisCartProduct.remove();});
  }
    
  getData() {
    // id, amount, price, priceSingle, name i params
    const thisCartProduct = this;

      

    const productOrderData = {
      amount : thisCartProduct.amount,
      id: thisCartProduct.id,
      name : thisCartProduct.name,
      price : thisCartProduct.price,
      priceSingle : thisCartProduct.priceSingle,
      params : thisCartProduct.params,
    };
      
    console.log('productOrderData: ',productOrderData);
    return productOrderData;
  }


  //for DOM elements only, non-DOM elements getter placed in constructor! - approach really morronic beyond belief, but what a man can do againt such a reckless stupidity?
  getElements(element) {

    const thisCartProduct = this;
      
    thisCartProduct.dom ={};
    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper;
    thisCartProduct.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      
    //get remove and edit dom objects
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    // console.log('thisCartProduct.dom.edit: ', thisCartProduct.dom.edit);
    // console.log('thisCartProduct.dom.remove: ', thisCartProduct.dom.remove);
      
  }

  //create a increase/decrease amount functionality in cart
  initCartAmountWidget() {
      
    //assign new name to Cart Product instance
    const thisCartProduct = this;

    //create new AmountWidget instance
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

    //corrent the initial value in above created, AmountWidget instance.
    thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
      
    //assign event listener to amount widget
    thisCartProduct.dom.amountWidget.addEventListener('updated',function() {thisCartProduct.updatedHandler();});
  }
      
  //run it when eventListenerTriggered
  updatedHandler() {

    const thisCartProduct = this;
      
    //update thisCartProduct instance values
    thisCartProduct.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value ;

    //set price in Cart amount widget
    thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles : true,
      detail : {
        cartProduct : thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    console.log('remove event sent');
  }
}

export default CartProduct;
