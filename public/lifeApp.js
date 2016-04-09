/* jshint esversion: 6 */

angular.module('lifeApp', ['ui.router', 'angularMoment'])
  .config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      //SPLASH SCREEN
      .state('home', {
        url: '/',
        templateUrl: 'splash.html'
      })
      //CALENDAR VIEWS
      .state('calendar', {
        controller: 'calendarCtrl',
        template: '<ui-view>',
        abstract: true
      })
      .state('calendar.agenda', {
        url: '/calendar/agenda::optionFlag',
        templateUrl: '/calendar/agenda.html'
      })
      .state('calendar.day', {
        url: '/calendar/day:optionFlag',
        templateUrl: '/calendar/day.html'
      })
      .state('calendar.week', {
        url: '/calendar/week:optionFlag',
        templateUrl: '/calendar/week.html'
      })
      .state('calendar.month', {
        url: '/calendar/month:optionFlag',
        templateUrl: '/calendar/month.html'
      })
      //LIST VIEWS
      .state('list', {
        controller: 'listCtrl',
        template: '<list-header></list-header><ui-view>',
        abstract: true,
        resolve: {
          PriorState($state){
            var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
            };
            return currentStateData;
          }
        }
      })
      .state('list.search', {
        url: '/list/search',
        templateUrl: '/list/search.html'
      })
      .state('list.star', {
        url: '/list/star',
        templateUrl: '/list/star.html'
      })
      .state('list.active', {
        url: '/list/active',
        templateUrl: '/list/active.html'
      })
      .state('list.pending', {
        url: '/list/pending',
        templateUrl: '/list/pending.html'
      })
      .state('list.inactive', {
        url: '/list/inactive',
        templateUrl: '/list/inactive.html'
      })
      .state('list.completed', {
        url: '/list/completed',
        templateUrl: '/list/completed.html'
      })
      .state('project', {})
      .state('user', {});
  });
