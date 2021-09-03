import { classNames, select, settings, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingElement) {
    this.render(bookingElement);
    this.initWidgets();
    this.getData();
    this.initClickingTables();

    this.sendOrder();

  }

  sendOrder() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db;

    console.log('thisBooking.hoursAmountWidget',thisBooking.peopleAmountWidget);
    
          

    console.log(thisBooking.dom.orderConfirmation.children.item(0));
    const payload = {
      date : thisBooking.date,
      hour : thisBooking.hour,
      table : thisBooking.bookedTable,
      duration : thisBooking.hoursAmountWidget.dom.value,
      ppl : thisBooking.peopleAmountWidget.dom.value,
      starters : 0,
      phone : thisBooking.dom.orderConfirmation.children.item(0),
      address : thisBooking.dom.orderConfirmation.children.item(1), 
    };

    const orderWidget = thisBooking.dom.orderConfirmation.children;

    thisBooking.dom.bookingForm.addEventListener('submit', function(){
      event.preventDefault();
      console.log('submitted');
    });
   
    let checkbox =  thisBooking.dom.bookingForm.querySelector('.checkbox');
    thisBooking.dom.bookingForm.addEventListener('click', function(){
      
      console.log(event.target);
    });
  }

  initClickingTables() { 
    const thisBooking = this;

    //create variable of booked table
    thisBooking.bookedTable = '';
    
    // get accesss to table wrappers
    const tablesWrapper = this.dom.tablesWrapper;

    //add event listener to common wrapper and switch the bahaviour of target
    tablesWrapper.addEventListener('click', function(event){
      //assign target element as local variable
      let targetElement  = event.target;

      //assign array of tables to local var
      let tablesArr = thisBooking.dom.tables;

      //loop through tables array
      for (let table of tablesArr) {
        //remove activeTable class from all tables except for clicked one
        if(table != targetElement){
          table.classList.remove('activeTable');
        }
      }

      //toggle active classon selected one
      let classList = targetElement.classList;
      if (!classList.contains('booked')){

        // behavior is defined by toggling tableBook class
        classList.toggle('activeTable');

        //create object to save
        if (classList.contains('activeTable')) {
          thisBooking.bookedTable = targetElement.getAttribute('data-table');
          console.log(thisBooking);
        }
      }
    });

    this.dom.wrapper.addEventListener('updated', function() {
      //deselect all tables
      const tablesArr = thisBooking.dom.tables;

      for(let table of tablesArr) {
        table.classList.remove('activeTable');
      }
    })

  }
  updateDOM() {
    //assign this Booking instance to thisBooking local var
    const thisBooking = this;

    //obtain date value
    thisBooking.date = thisBooking.datePicker.correctValue;
    console.log(thisBooking.date);

    //obtain hour in corret format (12:00 -> 12)
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    //set allAvailable local var to false by defalult
    let allAvailable = false;

    //check if there's any table booked at the certain hour, i.e. if there's a tables array
    if(
      //check if there's a date preseent
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      // check if there's a hour present
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      //if both not set all tables to available
      allAvailable = true;
    }

    //LOOP through every table in table array in wrapper
    for(let table of thisBooking.dom.tables) {

      //attain table id by given attribute
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      //if ID has been passed as string parse it to int
      if(typeof tableId == 'string'){
        tableId = parseInt(tableId);
      }

      //if !allAvailable (specific hour block for specific table) ...
      // check if array contain this table number 
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        
        //mark id as booked if yes
        table.classList.add(classNames.booking.tableBooked);
      } else {
        //mark as free if not
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  getData(){
    const thisBooking = this;

    //
    const params = {
       
      booking: [
        settings.db.dateStartParamKey + "=" + utils.dateToStr(thisBooking.datePicker.minDate),
        settings.db.dateEndParamKey   + "=" + utils.dateToStr(thisBooking.datePicker.maxDate),
      ],
       
      eventsCurrent: [
        settings.db.notRepeatParam,
        settings.db.dateStartParamKey + "=" + utils.dateToStr(thisBooking.datePicker.minDate),
        settings.db.dateEndParamKey   + "=" + utils.dateToStr(thisBooking.datePicker.maxDate),
      ],
      
      eventsRepeat: [
        settings.db.repeatParam,
        settings.db.dateEndParamKey + "=" + utils.dateToStr(thisBooking.datePicker.minDate),
      ]
    };

    
    // console.log('getData params:', params);

    const urls = {
      booking:        settings.db.url+'/'+ settings.db.booking + '?' + params.booking.join('&') ,
      eventsCurrent:  settings.db.url+'/'+ settings.db.event +   '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url+'/'+ settings.db.event +   '?' + params.eventsRepeat.join('&'),
    };

    // console.log('urls',urls);
    
    Promise.all([
      fetch(urls.booking), //will be more fetch'es
      fetch(urls.eventsCurrent), //will be more fetch'es
      fetch(urls.eventsRepeat), //will be more fetch'es
    ])
      .then(function (allResponses){ //function receive responses from all the fetches
        const bookingResponse = allResponses[0] //get booking resp. from responses array
        const eventsCurrentResponse = allResponses[1] //get booking resp. from responses array
        const eventsRepeatResponse = allResponses[2] //get booking resp. from responses array
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      }) 
      .then(function ([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  } //end of getData function

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    // create booked tables object
    thisBooking.booked = {};

    // loop through all current events acquired from api to fulfill 
    //'booked' object 

    //CURRENT EVENTS loop
    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    // REPEATING EVENTS loop
    for(let item of eventsRepeat) {

      //loop through daily events
      if (item.repeat == 'daily'){
        
        //assign local variables of minDate and maxDate
        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        //loop through all days from selected period 
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // BOOKINGS loop
    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    thisBooking.updateDOM();
  }

  
  makeBooked(date, hour, duration, table) {
    const thisBooking= this;
    //switch hour format, i.e. 12:00 -> 12.5
    const startHour = utils.hourToNumber(hour);

    
    //check if there's a date instance created in booked object
    if (!thisBooking.booked.hasOwnProperty(date)){
      // make one if there isn't any
      thisBooking.booked[date] = {};
    }
    

    //check if there's a hour instance created in booked object
    if (!thisBooking.booked[date].hasOwnProperty(startHour)){
      // make one if there isn't any
      thisBooking.booked[date][startHour] = [];
    }

    //loop throug all the hour block in duration meantime
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5 ){
        
      //check if there's a hour instance created in booked object
      if (!thisBooking.booked[date].hasOwnProperty(hourBlock)){
        // make one if there isn't any
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
      
    }
  }

  
    
  // create and fill this.dom object with references
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

    //DATE AND TIME FUNCTIONALITIES
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    // TABLES array
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);

    //TABLES wrapper
    this.dom.tablesWrapper = this.dom.wrapper.querySelector(select.booking.floorPlan);

    //STARTERS array of checkboxes
    this.dom.startersWrapper = this.dom.wrapper.querySelector('.booking-options').children[2];
    console.log(this.dom.startersWrapper);

    //booking form
    this.dom.bookingForm = this.dom.wrapper.querySelector(select.booking.bookingForm);
    console.log(this.dom.bookingForm);

    //PHONE and ADDRESS
    this.dom.orderConfirmation = this.dom.wrapper.querySelector(select.booking.orderConfirmation);
    console.log(this.dom.orderConfirmation);
  }
  //create a increase/decrease amount functionality in cart
  initWidgets() {
    const thisBooking = this;    

    //create new AmountWidget instance
    this.hoursAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.peopleAmountWidget = new AmountWidget(this.dom.hoursAmount);

    //corrent the initial value in above created, AmountWidget instance.
    // thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
        
    //assign event listener to amount widget
    this.dom.hoursAmount.addEventListener('updated',function() {console.log('haw works!');});
    this.dom.peopleAmount.addEventListener('updated',function() {console.log('paw works!');});

    //run hour and date picker
    this.hourPicker = new HourPicker(this.dom.hourPicker);
    this.datePicker = new DatePicker(this.dom.datePicker);


    //add event listener to any amount widget listening for 'updated' event
    this.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    })
  }
}

export default Booking;
