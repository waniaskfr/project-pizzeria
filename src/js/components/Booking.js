import {select, templates, settings} from '../settings.js';
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

    //console.log('thisBooking.render', thisBooking.render);
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate)
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate)

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
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
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
    // console.log('dom.wrapper', thisBooking.dom.wrapper);
    /* change content wrapper to html code from template */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper.appendChild(generatedDOM);
    // console.log('generatedDOM', generatedDOM);
    /* save to thisBooking.dom.peopleAmount single element from wrapper matching to select.booking.peopleAmount */
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    // console.log('peopleAmount', thisBooking.dom.peopleAmount);   
    /* simillary to peopleAmount save element for hoursAmount */
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    // console.log('hoursAmount', thisBooking.dom.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    // console.log('thisBooking.dom.datePicker', thisBooking.dom.datePicker);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    // console.log('thisBooking.dom.hourPicker', thisBooking.dom.hourPicker);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    // console.log('thisBookingPeopleAmount', thisBooking.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    // console.log('thisBookingHoursAmount', thisBooking.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

  }

}