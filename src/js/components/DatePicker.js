import {select, settings} from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    console.log('minDate', thisWidget.minDate);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    console.log('maxDate', thisWidget.maxDate);

    
    const options = {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      disable: [
        function(date) {
        // return true to disable
          return (date.getDay() === 1); // 1 = monday
        }
      ],
      locale: {
        firstDayOfWeek: 1 // start week on Monday
      },
      onChange: function(dateStr){
        thisWidget.value = dateStr;
      },

    }
    flatpickr(thisWidget.dom.input, options);

  }

  parseValue(){
    return ;
  }

  isValid(){
    return true;
  }

  renderValue(){
   
  }
}