// Import Node Module dependencies
import angular from 'angular';
import angularMoment from 'angular-moment';
import uiRouter from 'angular-ui-router';
import moment from 'moment';

// Import stylesheets
import './primary.styl';

// Import states and views
import routes from './config';

// Imports controllers
import calendarCtrl from './calendar/calendarCtrl';
import listCtrl from './list/listCtrl';

// Import data services
import dataSvc from './dataSvc';

// Import directives
import {calHeader, optionPane, calendar, listHeader, taskItems, addItem,
        editItemPane, newItemPane, scheduler} from './directives/directives';
import {quickScheduler} from './directives/quickScheduler/quickScheduler';

// Instantiate App
angular.module('lifeApp', ['ui.router', 'angularMoment'])
  .config(routes)
  .controller(`calendarCtrl`, calendarCtrl)
  .controller(`listCtrl`, listCtrl)
  .service(`dataSvc`, dataSvc)
  .directive(`calHeader`, calHeader)
  .directive(`optionPane`, optionPane)
  .directive(`calendar`, calendar)
  .directive(`listHeader`, listHeader)
  .directive(`taskItems`, taskItems)
  .directive(`addItem`, addItem)
  .directive(`editItemPane`, editItemPane)
  .directive(`newItemPane`, newItemPane)
  .directive(`scheduler`, scheduler)
  .directive(`quickScheduler`, quickScheduler);
