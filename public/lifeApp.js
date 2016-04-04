angular.module('lifeApp', ['ui.router', 'angularMoment'])
  .config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'splash.html'
      })
      .state('agenda', {
        url: '/calendar/agenda',
        templateUrl: '/calendar/agenda.html',
        controller: 'calendarCtrl'
      })
      .state('day', {
        url: '/calendar/day',
        templateUrl: '/calendar/day.html',
        controller: 'calendarCtrl'
      })
      .state('week', {
        url: '/calendar/week',
        templateUrl: '/calendar/week.html',
        controller: 'calendarCtrl'
      })
      .state('month', {
        url: '/calendar/month',
        templateUrl: '/calendar/month.html',
        controller: 'calendarCtrl'
      })
      .state('list', {})
      .state('project', {})
      .state('user', {});
  });
