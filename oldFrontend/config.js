export default function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/list/star');
  $stateProvider
    //SPLASH SCREEN
    .state('home', {
      url: '/',
      template: require('./splash.html'),
      resolve: { dataServices: 'dataSvc' }
    })
    //CALENDAR VIEWS
    .state('calendar', {
      controller: 'calendarCtrl',
      template: '<cal-header></cal-header><ui-view></ui-view><quick-scheduler ng-if="quickSchedulerFlag"></quick-scheduler><edit-item-pane ng-if="editItemPaneFlag"></edit-item-pane>',
      abstract: true,
    //   resolve: { Authenticate: checkSession }
    })
    .state('calendar.agenda', {
      url: '/calendar/agenda',
      template: '<agenda />'
    })
    .state('calendar.day', {
      url: '/calendar/day',
      template: '<day />'
    })
    .state('calendar.week', {
      url: '/calendar/week',
      template: '<week />'
    })
    .state('calendar.month', {
      url: '/calendar/month',
      template: require('./calendar/month.html')
    })
    //LIST VIEWS
    .state('list', {
      controller: 'listCtrl',
      template: '<list-header></list-header><ui-view></ui-view><edit-item-pane ng-if="editItemPaneFlag"></edit-item-pane><new-item-pane ng-if="newItemPaneFlag"></new-item-pane>',
      abstract: true,
      resolve: {
        // Authenticate: checkSession,
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

    /// Check for active session ///
    function checkSession($q, dataSvc){
        let deferred = $q.defer();

        if(dataSvc.loaded) deferred.resolve(`User Authenticated.`);
        else deferred.reject({redirectTo: 'home'});

        return deferred.promise;

    } checkSession.$inject = [`$q`, `dataSvc`];

} routes.$inject = [`$stateProvider`, `$urlRouterProvider`];
