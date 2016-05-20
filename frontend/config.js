export default function routes ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    //SPLASH SCREEN
    .state('home', {
      url: '/',
      template: require('./splash.html')
    })
    //CALENDAR VIEWS
    .state('calendar', {
      controller: 'calendarCtrl',
      template: '<ui-view></ui-view>',
      abstract: true
    })
    .state('calendar.agenda', {
      url: '/calendar/agenda::optionFlag',
      template: require('./calendar/agenda.html')
    })
    .state('calendar.day', {
      url: '/calendar/day:optionFlag',
      template: require('./calendar/day.html')
    })
    .state('calendar.week', {
      url: '/calendar/week:optionFlag',
      template: require('./calendar/week.html')
    })
    .state('calendar.month', {
      url: '/calendar/month:optionFlag',
      template: require('./calendar/month.html')
    })
    //LIST VIEWS
    .state('list', {
      controller: 'listCtrl',
      template: '<list-header></list-header><ui-view></ui-view><edit-item-pane ng-if="editItemPaneFlag"></edit-item-pane><new-item-pane ng-if="newItemPaneFlag"></new-item-pane>',
      abstract: true,
      resolve: {
        PriorState: ['$state', function($state){
          var currentStateData = {
              Name: $state.current.name,
              Params: $state.params,
              URL: $state.href($state.current.name, $state.params)
          };
          return currentStateData;
        }]
      }
    })
    .state('list.search', {
      url: '/list/search',
      template: require('./list/search.html')
    })
    .state('list.star', {
      url: '/list/star',
      template: require('./list/star.html')
    })
    .state('list.active', {
      url: '/list/active',
      template: require('./list/active.html')
    })
    .state('list.pending', {
      url: '/list/pending',
      template: require('./list/pending.html')
    })
    .state('list.inactive', {
      url: '/list/inactive',
      template: require('./list/inactive.html')
    })
    .state('list.completed', {
      url: '/list/completed',
      template: require('./list/completed.html')
    })
    .state('user', {});
}

routes.$inject = [`$stateProvider`, `$urlRouterProvider`];
