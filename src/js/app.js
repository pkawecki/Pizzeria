import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {

  initPages: function(){
    const thisApp  = this;

    //get pages and links wrapper
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
   
    
    

    const idFromHash = window.location.hash.replace('#/', '');
    // console.log('idFromHash', idFromHash);

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    //activate page
    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        console.log('this',this);
        // get page id from href att
        const id = clickedElement.getAttribute('href').replace('#', '');
        
        // run thisApp.activatePage with that id
        thisApp.activatePage(id);

        //change URL hash
        window.location.hash = '#/'+ id;
      });
    }
  },

  activatePage : function(pageId) {
    const thisApp= this;

    //add class 'active' to matching pages, remove from non-matching
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    //add class 'active' to matching links, remove from non-matching
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initCart: function() {
    const thisApp = this;

    // acquire cart element
    const cartElem = document.querySelector(select.containerOf.cart);

    //assign cartElem to thisApp.cart. Having cart instance in thisApp.cart 
    //... will make an easy way of cart data management
    thisApp.cart = new Cart(cartElem);

    // console.log('thisApp:',thisApp);
    thisApp.productList = document.querySelector(select.containerOf.menu);


    thisApp.productList.addEventListener('add-to-cart',function(event) {
      // console.log('event.detail.product:', event.detail.product);
      app.cart.add(event.detail.product);
    });
  },

  initMenu : function(){  //function that create product instances
    const thisApp = this; //create new reference for object "this"
      
    // loop through the all products in thisApp.data object
    for(let productData in thisApp.data.products) { 

      //create Product class instance for every product object in data.products
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  }, 

  //initialize data object with the products
  initData: function(){

    //create new reference for object "this"
    const thisApp = this;

    //initialize new object "data" in app object
    thisApp.data = {};//dataSource};

    const url = settings.db.url + '/' + settings.db.products;
      
    // console.log(url);

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        // console.log('parsedResponse: ',parsedResponse);

        //save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;

        //execute initmenu Method -- probably done later
        thisApp.initMenu();
      });
  },

  initBooking : function() {

    const bookingElement = document.querySelector(select.containerOf.booking);
    // console.log(bookingElement);

    const thisBooking = new Booking(bookingElement);
    console.log('thisBooking initiated but never used', thisBooking);
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
    thisApp.initPages();
    thisApp.initBooking();
  },
};

app.init(); //initialize entire app

