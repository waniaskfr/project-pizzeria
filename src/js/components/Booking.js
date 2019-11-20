import {select, templates} from '../settings.js';
import utils from '../utils.js';

export class Booking{
  constructor(bookingWidgetContainer) {
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
    console.log('dom.wrapper', thisBooking.dom.wrapper);
    /* change content wrapper to html code from template */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom.wrapper.appendChild(generatedDOM);
    console.log('generatedDOM', generatedDOM);
    /* save to thisBooking.dom.peopleAmount single element from wrapper matching to select.booking.peopleAmount */
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    console.log('peopleAmount', thisBooking.dom.peopleAmount);   
    /* simillary to peopleAmount save element for hoursAmount */
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    console.log('hoursAmount', thisBooking.dom.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;

  }

}