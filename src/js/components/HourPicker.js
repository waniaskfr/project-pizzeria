import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';


export class HourPicker extends BaseWidget {
  constructor(){
    super(wrapper, settings.hours.open);
    const thisWigdet = this;

    thisWigdet.dom.input = thisWigdet.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
   
  }

  initPlugin(){
      
  }
}
