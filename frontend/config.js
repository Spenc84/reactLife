export default function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/list/star');
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
      abstract: true,
      resolve: { Tasks: getTasks, User: getUser }
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
        }],
        Tasks: getTasks,
        User: getUser
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

    /// Aquire task data before loading views ///
      function getTasks($state, $q, dataSvc){
        var deferred = $q.defer();
        if(dataSvc.tasks) deferred.resolve('Tasks already loaded');
        else
        dataSvc.getTasks().then(
          function(tasks){
            dataSvc.tasks = tasks.data;
            deferred.resolve("Tasks aquired");
          },
          function(rejected){ alert("Failed to aquire tasks"); deferred.reject("Failed to aquire tasks"); $state.go("home");}
        );
        return deferred.promise;
      }
      getTasks.$inject = [`$state`, `$q`, `dataSvc`];

/////////////////////////////  TEMPORARY  //////////////////////////////////////
      function getUser($state, $q, dataSvc){
        var deferred = $q.defer();
        if(dataSvc.user) deferred.resolve('User already loaded');
        else
        dataSvc.getUser().then(
          function(user){
            dataSvc.user = user.data; console.log(`User aquired: `, user.data);
            deferred.resolve("User aquired");
          },
          function(rejected){ alert("Failed to aquire user"); deferred.reject("Failed to aquire user"); $state.go("home");}
        );
        return deferred.promise;
      }
      getUser.$inject = [`$state`, `$q`, `dataSvc`];
////////////////////////////////////////////////////////////////////////////////

}

routes.$inject = [`$stateProvider`, `$urlRouterProvider`];
