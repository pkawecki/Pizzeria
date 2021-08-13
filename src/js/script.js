/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      ;
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
      thisProduct.amountWidgetElem.addEventListener('updated', function(event){console.log('event: ',event); thisProduct.processOrder();});
      
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
      thisWidget.input.addEventListener('change', function() {thisWidget.setValue(thisWidget.input.value) ; console.log(thisWidget.input.value);}); //this.setValue(this.input)
      thisWidget.linkIncrease.addEventListener('click', function(){thisWidget.setValue(parseInt(thisWidget.input.value)+1);});
      thisWidget.linkDecrease.addEventListener('click',  function(){thisWidget.setValue(parseInt(thisWidget.input.value)-1);});
    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      console.log(event);
      thisWidget.element.dispatchEvent(event);
      

    }
  }

  const app = {
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
      thisApp.data = dataSource;
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
    },
  };

  app.init(); //initialize entire app
}
