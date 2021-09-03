import {select, templates, settings} from '../settings.js';
import { utils } from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    //assign new name for instance
    const thisCart = this;

    //create new object for all the products
    thisCart.products = [];

    //get all necessary elements for constructor
    thisCart.getElements(element);

    // log the contenf of cart
    // 
    //init event listener
    this.initActions();
  }

  add(menuProduct) {
    const thisCart = this;
      
    //generate HTML based on template 
    const generatedHTML = templates.cartProduct(menuProduct);
      
    //create element using utils.createElementFromHTML
    let generatedDOM = utils.createDOMFromHTML(generatedHTML);
      

    //push the product into thisCart.products array
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    //append DOM object to cart
    thisCart.dom.productList.appendChild(generatedDOM);

    //run update prices
    thisCart.update();

  }
  initActions() {
    //assign new name for instance
    const thisCart = this;

    //add event listener to cart wrapper
    thisCart.dom.toggleTrigger.addEventListener('click', function() {thisCart.dom.wrapper.classList.toggle('active');});

    //catch updated event
    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });

    //assign remove listener to productList
    thisCart.dom.productList.addEventListener('remove', function() {
      thisCart.remove(event.detail.cartProduct);
      thisCart.update();
    });
      
    //assign eventListener to submit button
    thisCart.dom.form.addEventListener('submit', function() {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

          
    const payload = {
      address: thisCart.address.value,
      phone: thisCart.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.dom.subtotalPrice.innerHTML,
      totalNumber: thisCart.dom.totalNumber,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      products: [],
    };

    for(let prod of thisCart.products) {

      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };
    fetch(url,options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse: ',parsedResponse);
      });
      
  }


  remove(detail) {
    const thisCart = this;
      
    
        
    //obtain index
    let index = thisCart.products.indexOf(detail);
      
    //remove from dom object (html content) 
    thisCart.dom.productList.children[index].remove();

    //remove from product list
    thisCart.products.splice(index, 1);

    //update Cart
    thisCart.update();
  }



  getElements(element) {
    //assign new name for instance
    const thisCart = this;

    //create new subobject in thisCart for all the dom objects
    thisCart.dom = {};

    //create and assign reference to dom.wrapper
    thisCart.dom.wrapper = element;
      
    //product list container
    thisCart.dom.productList = document.querySelector(select.cart.productList);

    //toggling cart wrapper visibility
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    //cart numerals 
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

    //thisCart total price
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    // 
    //thisCart form dom element
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    // 
    //sendOrder method payload data
    thisCart.address = thisCart.dom.form.elements.address;
    thisCart.phone = thisCart.dom.form.elements.phone;


    //     //     // 
    //     //     // 
  }

  update() {
    const thisCart = this;

    //acquire default delivery fee
    let deliveryFee = settings.cart.defaultDeliveryFee;

    //declare constants
    let subtotalPrice = 0;

    //loop through all products
    for (let product of thisCart.products) {
      //       totalNumber += product.amount;
      subtotalPrice += product.price;
    }
    if (subtotalPrice != 0) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;

    }

    else {
      deliveryFee = 0;
      subtotalPrice = 0;
      thisCart.totalPrice = 0;
    }
      
    //update html fields
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

    //loop through places where totalPrice is displayed
    for (let elelemt of thisCart.dom.totalPrice) {
      elelemt.innerHTML = thisCart.totalPrice; 
      
    }
    console.log('thisCart.dom.subtotalPrice',thisCart.dom.subtotalPrice);
    //update totalNumber 
    //     thisCart.dom.totalNumber = totalNumber;
  }
}

export default Cart;