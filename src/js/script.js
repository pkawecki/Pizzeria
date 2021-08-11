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
      
      
      ;
    }

    initOrderForm() {
      const thisProduct = this;
      console.log(this.initOrderForm.name);
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        // console.log('click');
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
          // console.log('click');
        });

       
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        // console.log('click');
      });
    
    }

    processOrder() {
      const thisProduct = this;
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
    
      // set price to default price
      let price = thisProduct.data.price;

      // console.log('olive including: ',formData.toppings.includes('olives'));
    
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);
    
        // for every option in this category
        for(let optionId in param.options) {
          
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //increase price


         console.log('paramId: ',paramId);
         console.log('param: ',param);
         
         console.log('optionId: ',optionId);
         console.log('option: ',option);

         console.log(formData[paramId].includes(optionId));
         if (formData[paramId].includes(optionId)) {
           if (option.default) {
             //leave the preice same
           }
           else {
            price += option.price;
           }
         }
         else {
           if(option.default) {
             price -= option.price;
           }
           else {
             //leave price the same
           }
         }


          //decrease price

          //remain the same price
          console.log(optionId, option);
        }
      }
    
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
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

    }

    initAccordion() {
      const thisProduct = this;
      
      //find the clickable trigger - deprecatted
      //useing new variable declared in thisProduct.accordionTrigger
      // const clickableTrigger = thisProduct.element.querySelector('i'); //querySelector('fa-chevron-down');
  

      
      //START: add event listener to clickable trigger on event click
      thisProduct.accordionTrigger.addEventListener('click', function(event){

        // prevent default action
        event.preventDefault();

        // console.log('click');

        // find active product (the one that has active class)
        let activeProduct = document.querySelector('article.active');
        console.log(activeProduct);
        
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

  const app = {
    initMenu : function(){
      const thisApp = this;
      console.log('thisApp.data ', thisApp.data);

      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };


  app.init();
}
