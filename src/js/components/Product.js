import {select, templates, classNames} from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWIdget.js';


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

    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles : true,
      detail : {
        product : thisProduct.prepareCartProduct(),
      }
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;