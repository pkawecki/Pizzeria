/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED

    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
  // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },// CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END

    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
  };

  class Product{
    constructor(id,data){
      const thisProduct = this;

      this.id = id;
      this.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();

      thisProduct.processOrder();

      thisProduct.prepareCartProduct();
    }
    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());

    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.priceSingle * productSummary.amount;

      productSummary.params = thisProduct.prepareCartProductParams();

      // console.log('thisProduct.productSummary: ',productSummary);
      console.log('prepareCartProduct.thisProduct: ',thisProduct);

      return productSummary;      

    }

    prepareCartProductParams() {

      
      const thisProduct = this;
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
     
      //CODE ADDED, new object defined
      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        
        //create param subobject in params object
        params[paramId] = {
          label: param.label,
          options : {}
        };
    
        // for every option in this category
        for(let optionId in param.options) {
          
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          
          //check if formData contains optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          //check whether the option selected exist and if so create key-value pair in params
          if(optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
        
      } 
     
      //make prepareCartProductParams return params object
      return params;
    }

    initOrderForm() {
      const thisProduct = this;
      
      //add eventListener to submit button
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        
      });
      
      //add eventListener to value change in form
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
          
        });
      }
      
      //add eventListener to 
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.cartButton.addEventListener('click', thisProduct.addToCart());
      });
    }

    processOrder() {
      const thisProduct = this;
      
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
     
    
      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        
    
        // for every option in this category
        for(let optionId in param.options) {
          
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //increase price


          if (formData[paramId].includes(optionId)) {
            if (option.default) {
              //leave the preice same
            }
            else {
              //increase price
              price += option.price;
            }
          }
          else {
            //decrease price
            if(option.default) {
              price -= option.price;
            }
            else {
              //leave price the same
            }
          }

          //image name expression
          let expr = paramId+'-'+optionId;

          //img elementquerySelector
          let completePath =thisProduct.imageWrapper.querySelector('img.'+expr);

          //classList declaration
          let pathClassList;

          //check whether selector has given any output
          if( completePath != null) {

            //assign classList array to pathClassList variable
            pathClassList = completePath.classList;

            //apply changes to product image based on data acquired from formData
            if (formData[paramId].includes(optionId)){
              pathClassList.add(classNames.menuProduct.imageVisible);
            }
            else {
              pathClassList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      } 
      thisProduct.priceSingle = price;

      price *= thisProduct.amountWidget.input.value;
      
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

    renderInMenu(){
      const thisProduct = this;
      
      //generate HTML based on template 
      const generatedHTML = templates.menuProduct(thisProduct.data);
      

      //create element using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      
      //find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);

      //add element to menu
      menuContainer.appendChild(thisProduct.element);
    }  

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);


      //form is created first
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //form usage is applied later
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);


      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

      thisProduct.imageWrapper =  thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      
    }

    initAmountWidget() {
      const thisProduct = this;

      
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){ thisProduct.processOrder();});
      
    }

    initAccordion() {
      const thisProduct = this;
      
      //START: add event listener to clickable trigger on event click
      thisProduct.accordionTrigger.addEventListener('click', function(event){

        // prevent default action
        event.preventDefault();
        
        // find active product (the one that has active class)
        let activeProduct = document.querySelector('article.active');
        
        
        //if there is active product and it's not thisProduct.element, remove active class
        if (activeProduct!=null && activeProduct!=thisProduct.element) {
          activeProduct.classList.toggle('active');
        }

        //toggle active class on thiProduct.element
        // thisProduct.element.classList.toggle('active');
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
  }

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

  class Cart {
    constructor(element) {
      //assign new name for instance
      const thisCart = this;

      //create new object for all the products
      thisCart.products = [];

      //get all necessary elements for constructor
      thisCart.getElements(element);

      // log the contenf of cart
      // console.log('new Cart', thisCart);

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

      // console.log('adding product (cart.add() method working', menuProduct);
      console.log('(Cart)cart.add.thisCart.products - after pushing: ', thisCart.products);
      
      //run update prices
      thisCart.update();
    }
    initActions() {
      //assign new name for instance
      const thisCart = this;

      //add event listener to cart wrapper
      thisCart.dom.toggleTrigger.addEventListener('click', function() {thisCart.dom.wrapper.classList.toggle('active');});

      //
      thisCart.dom.productList.addEventListener('updated', function() {
        // console.log('Listener at productList in Cart instance is working');
        thisCart.update();
      });

      //assign remove listener to productList
      thisCart.dom.productList.addEventListener('remove', function() {console.log('event detalis: ',event); thisCart.remove(event.detail.cartProduct);});
      
    }

    remove(detail) {
      const thisCart = this;
      
      console.log('detail caught in thisCart.remove(): ',detail);

      console.log('thisCart.dom.productList: ', thisCart.dom.productList);
      console.log('thisCart.products: ', thisCart.products);

      //obtain index
      let index = thisCart.products.indexOf(detail);
      
      //remove from dom object (html content) 
      thisCart.dom.productList.children[index].remove();

      //remove from product list
      thisCart.products.splice(index, 1);
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

      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      console.log('thisCart.dom.totalPrice ', thisCart.dom.totalPrice);
    }

    update() {
      const thisCart = this;

      //acquire default delivery fee
      const deliveryFee = settings.cart.defaultDeliveryFee;

      //declare constants
      let totalNumber = 0, subtotalPrice =0;

      //loop through all products
      for (let product of thisCart.products) {
        console.log('loop works');
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
      if (subtotalPrice != 0) {
        thisCart.totalPrice = subtotalPrice + deliveryFee;

      }
      
      //update html fields
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

      //loop through places where totalPrice is displayed
      for (let elelemt of thisCart.dom.totalPrice) {
        elelemt.innerHTML = thisCart.totalPrice; 
      }
      console.log(totalNumber);
    }
  }

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
    
    //for DOM elements only! - morronic approach beyond belief, but what can I do?
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

      //corrent the initial value in, above created, AmountWidget instance.
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

  const app = {
    initCart: function() {
      const thisApp = this;

      // acquire cart element
      const cartElem = document.querySelector(select.containerOf.cart);

      //assign cartElem to thisApp.cart. Having cart instance in thisApp.cart 
      //... will make an easy way of cart data management
      thisApp.cart = new Cart(cartElem);
    },

    initMenu : function(){  //function that create product instances
      const thisApp = this; //create new reference for object "this"
      
      // loop through the all products in thisApp.data object
      for(let productData in thisApp.data.products) { 

        //create Product class instance for every product object in data.products
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    //initialize data object with the products
    initData: function(){

      //create new reference for object "this"
      const thisApp = this;

      //initialize new object "data" in app object
      thisApp.data = {};//dataSource};

      const url = settings.db.url + '/' + settings.db.products;
      
      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })

        console.log('fetch: ', fetch(url));
        fetch(url);
    },

    //initializing function. It uses initData subfunction to create data object and init menu 
    //to create products
    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init(); //initialize entire app
}
