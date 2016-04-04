/* jshint esversion: 6 */

angular.module('lifeApp')
.directive('calHeader', () => {
  return {
    restrict: 'E',
    templateUrl: './directives/calHeader.html',
    scope: {
      icon: '@',
      view: '@',
      month: '='
    },
    link(scope, element, attrs, ctrl) {
      scope.eyeFlag = true;
      scope.monthFlag = false;
      scope.optionFlag = false;
      scope.toggleOption = function() {
        scope.optionFlag = !scope.optionFlag;
      };
      scope.toggleMonth = function() {
        scope.monthFlag = !scope.monthFlag;
      };
      scope.toggleEye = function() {
        scope.eyeFlag = !scope.eyeFlag;
      };
    },
  };
})
.directive('optionPane', () => {
  return {
    restrict: 'E',
    templateUrl: './directives/optionPane.html',
    scope: {
      toggle: '=',
      month: '='
    },
    link(scope, element, attrs, ctrl) {

    },
  };
})
.directive('calendar', () => {
  return {
    restrict: 'E',
    templateUrl: './directives/calendar.html',
    scope: {
      month: '='
    },
    link(scope, element, attrs, ctrl) {
    },
  };
});
