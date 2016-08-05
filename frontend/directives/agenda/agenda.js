//the modal that allows you to quickly choose a time for your task
export function agenda(moment, dataSvc, $location, $anchorScroll, $timeout) {
    return {
        restrict: 'E',
        template: require('./agenda.html'),
        link(scope, element, attrs, ctrl) {
            let today = moment().startOf('day').toJSON();
            const addTodayAnchor = ()=>{
                if(scope.agenda.findIndex(day=>day.date === today) === -1) {
                    scope.agenda.push({
                        date: today,
                        start: [],
                        soft: [],
                        hard: []
                    });
                }
            };
            addTodayAnchor();
            $location.hash(today);

            const removeListener = dataSvc.addListener(()=>{
                addTodayAnchor();
                $timeout(()=>$anchorScroll(), 0);
            });
            scope.$on('$destroy', ()=>removeListener());
        }
    };
} agenda.$inject = [`moment`, `dataSvc`, `$location`, `$anchorScroll`, `$timeout`];
