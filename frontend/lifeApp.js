// Import dependencies
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
        newItemPane} from './directives/directives';
import {editItemPane} from './directives/editItemPane/editItemPane';
import {quickScheduler} from './directives/quickScheduler/quickScheduler';
import {agenda} from './directives/agenda/agenda';
import {day} from './directives/day/day';
import {week} from './directives/week/week';

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
  .directive(`quickScheduler`, quickScheduler)
  .directive(`agenda`, agenda)
  .directive(`day`, day)
  .directive(`week`, week)
  .run(onAppStart);

// This will be run upon initiating the app
function onAppStart($rootScope, $state, $location, $anchorScroll) {
    //when the route is changed scroll to the proper element.
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        if($location.hash()) $anchorScroll();
    });
    /* If the user trys to access a protected page without proper Authentication
    they will be instructed to login first and redirected to the login page */
    $rootScope.$on('$stateChangeError', function(evt, to, toParams, from, fromParams, error) {
        if (error.redirectTo) {
            alert(`Login Required.`);
            $state.go(error.redirectTo);
        }
        else alert('error: ', error.status);
    });
} onAppStart.$inject = ['$rootScope', '$state', '$location', '$anchorScroll'];
