//the modal that allows you to quickly choose a time for your task
export function day(moment, dataSvc, $location, $anchorScroll, $timeout) {
  return {
    restrict: 'E',
    template: require('./day.html'),
    link(scope, element, attrs, ctrl) {
      // $location.hash(null);
      // $timeout(()=>$location.hash(1466830800000),5);
      $location.hash(moment().format('ha'));
    }
  };
} day.$inject = [`moment`, `dataSvc`, `$location`, `$anchorScroll`, `$timeout`];
