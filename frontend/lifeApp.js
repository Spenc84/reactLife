// Import Node Module dependencies
import angular from 'angular';
import angularMoment from 'angular-moment';
import uiRouter from 'angular-ui-router';
import moment from 'moment';

// Import stylesheets
import './primary.styl';

// Import states and views
import routes from './config';

// Imports for Calendar feature
import calendarCtrl from './calendar/calendarCtrl';
import calendarSvc from './calendar/calendarSvc';

// Imports for List Feature
import listCtrl from './list/listCtrl';
import listSvc from './list/listSvc';

// Import directives
import {calHeader, optionPane, calendar, listHeader, taskItems, addItem,
        editItemPane, newItemPane, quickScheduler} from './directives/directives';

// Instantiate App
angular.module('lifeApp', ['ui.router', 'angularMoment'])
  .config(routes)
  .controller(`calendarCtrl`, calendarCtrl)
  .controller(`listCtrl`, listCtrl)
  .service(`calendarSvc`, calendarSvc)
  .service(`listSvc`, listSvc)
  .directive(`calHeader`, calHeader)
  .directive(`optionPane`, optionPane)
  .directive(`calendar`, calendar)
  .directive(`listHeader`, listHeader)
  .directive(`taskItems`, taskItems)
  .directive(`addItem`, addItem)
  .directive(`editItemPane`, editItemPane)
  .directive(`newItemPane`, newItemPane)
  .directive(`quickScheduler`, quickScheduler);
