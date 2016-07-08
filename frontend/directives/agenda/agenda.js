//the modal that allows you to quickly choose a time for your task
export function agenda(moment, dataSvc, $location, $anchorScroll, $timeout) {
  return {
    restrict: 'E',
    template: require('./agenda.html'),
    link(scope, element, attrs, ctrl) {
      // $location.hash(null);
      // $timeout(()=>$location.hash(1466830800000),5);
      $location.hash(moment().startOf('day').format('x'));
      console.log(moment().startOf('day').toString());
    }
  };
} agenda.$inject = [`moment`, `dataSvc`, `$location`, `$anchorScroll`, `$timeout`];
