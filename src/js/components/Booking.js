import {select, templates} from '../settings.js';
import utils from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking{
  constructor(bookingWidgetContainer){
    const thisBooking = this;
    
    thisBooking.render(bookingWidgetContainer);
    thisBooking.initWidgets();
    console.log('thisBooking.render', thisBooking.render);
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
    console.log('thisBooking.dom.datePicker', thisBooking.dom.datePicker);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    console.log('thisBooking.dom.hourPicker', thisBooking.dom.hourPicker);
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