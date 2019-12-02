import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';


export class Booking{
  constructor(bookingWidgetContainer){
    const thisBooking = this;

    thisBooking.render(bookingWidgetContainer);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.clickedTable();

    //console.log('thisBooking.render', thisBooking.render);
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //  console.log('getData params', params);

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking
                                            + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event
                                            + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event
                                            + '?' + params.eventsRepeat.join('&'),
    };
    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }


  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked ={};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    thisBooking.tableId = null;

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  clickedTable(){
    const thisBooking = this;
    /* START LOOP and fine one table from tables */
    for(let table of thisBooking.dom.tables){
      /* check if table have booked status after click, if no add, if yes remove */
      table.addEventListener('click', function(){
        if(table.classList.contains(classNames.booking.tableBooked)){
          return;
        }
        else {
          const hours = thisBooking.hoursAmount.value;
          const presentHour = utils.hourToNumber(thisBooking.hourPicker.value);
          const presentDay = thisBooking.datePicker.value;
          const tableId = parseInt(table.getAttribute('data-table'));

          console.log('Booked', thisBooking.booked);
          console.log(hours, presentHour, presentDay, tableId);

          let isFreeTable = true;

          for(let hour = presentHour; hour < presentHour + hours; hour = hour += 0.5) {
            if(thisBooking.booked[presentDay]) {
              if(thisBooking.booked[presentDay][hour]) {
                if(thisBooking.booked[presentDay][hour].includes(tableId)) {
                  isFreeTable = false;
                  break;
                }
              }
            }
          }

          if(isFreeTable) {
            thisBooking.tableId = parseInt(table.getAttribute('data-table'));
            table.classList.toggle(classNames.booking.tableBooked);
          } else {
            alert('Stolik jest zajęty!');
          }

        }
      });
    }

    thisBooking.dom.formButton.addEventListener('click', function(){
      event.preventDefault();
      console.log('clickedFormButton');
      thisBooking.sendBooked();
    });
  }

  sendBooked(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const sending = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      duration: thisBooking.dom.hours.value,
      people: thisBooking.dom.people.value,
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
      table: thisBooking.tableId,
      starters: [],
    };
    console.log('sending', sending);

    for(let starter of thisBooking.dom.starters){
      if(starter.checked == true){
        sending.starters.push(starter.value);
      }
    }
    console.log('sending.starters', sending.starters);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sending),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }

  render(element){
    const thisBooking = this;



    /* generate HTML code from templates.bookingWigdet without any arguments */
    const generatedHTML = templates.bookingWidget();
    /* create empty object thisBooking.dom */
    thisBooking.dom = {};
    /* save to this object wrapper property equals argument */
    thisBooking.dom.wrapper = element;
    /* change content wrapper to html code from template */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper.appendChild(generatedDOM);
    /* save to thisBooking.dom.peopleAmount single element from wrapper matching to select.booking.peopleAmount */
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    /* simillary to peopleAmount save element for hoursAmount */
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    // console.log('hourPicker', thisBooking.dom.hourPicker);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.formButton = thisBooking.dom.wrapper.querySelector(select.booking.formButton);
    // console.log('formButton', thisBooking.dom.formButton);
    thisBooking.dom.hours = thisBooking.dom.wrapper.querySelector(select.booking.hours);
    thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(select.booking.people);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    // console.log('address', thisBooking.dom.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    // console.log('starters', thisBooking.dom.starters);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    // console.log('thisBookingPeopleAmount', thisBooking.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    // console.log('thisBookingHoursAmount', thisBooking.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

  }

}
