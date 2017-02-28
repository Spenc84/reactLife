import './filter.styl';
import React, { PureComponent, PropTypes } from 'react';
import { Map, List, fromJS } from 'immutable';

import { Icon, TextArea } from '../../uiComponents/ui';
import { Index, mergeObj, findData } from '../tools';

import { QUERY, STATUS_TAGS } from '../../defaults';


// Props: query (required), updateQuery (required), count
export default class Filter extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            not: false,
            pointer: ''
        };

        this.updateSearch = this.updateSearch.bind(this);
        this.toggleFlatten = this.toggleFlatten.bind(this);
        this.toggleExpanded = this.toggleExpanded.bind(this);
        this.toggleNot = this.toggleNot.bind(this);
        this.addStatus = this.addStatus.bind(this);
        this.removeStatus = this.removeStatus.bind(this);
        this.setPointer = this.setPointer.bind(this);
    }

    render() {
        const { expanded, not, pointer } = this.state;
        const { count:xCount, query = QUERY, statusTags = STATUS_TAGS } = this.props;

        const search = query.get('search') || '';
        const status = query.get('status') || List();
        const options = query.get('options') || Map();
        const count = options.get('flatten') ? 0 : xCount || 0;

        const add = (tag, path, list, some) => {
            const display
                = List.isList(tag) ? undefined
                : tag[0] === '!' ? tag[1].toUpperCase() + tag.slice(2)
                : tag[0].toUpperCase() + tag.slice(1);
            return (
                <div key={path} className={some ? 'column' : 'row'}>
                    <div className={some ? 'row' : 'column'}>
                    {
                        List.isList(tag)

                        ?   tag.map((tag,i,list)=>add(tag, [...path, i], list, !some))

                        :   <div className={some ? 'column' : 'row'}>
                                <div className={`${tag[0] === '!' ? 'excluded ':''}tag`}
                                    data-path={path}
                                    onClick={this.removeStatus}>
                                    {display}
                                </div>
                            </div>
                    }
                    { path.length > 3 ? null :
                        <Icon i={'add'}
                            onClick={this.setPointer}
                            data-pointer={path}
                            className={`${path}` === pointer ? 'active' : ''}
                            size={1-path.length*.2}
                        />
                    }
                    </div>
                    { path[path.length-1] === list.size-1 ? null :
                        some
                        ? <span className="context">or</span>
                        : <span className="context">and</span>
                    }
                </div>
            );
        };

        // const offsetStyle = bodyOffset
        //     ? {
        //         zIndex: 1,
        //         boxShadow: '0 1px 3px rgba(0,0,0,.34)'
        //     }
        //     : null;

        return (
            <div className="Filter">

                <div className="search row">
                    <div className="count">
                        <span>{count}</span>
                    </div>
                    <TextArea value={search} onChange={this.updateSearch} placeholder="Search..." rows={1} />
                    <Icon i={'center_focus_strong'} onClick={this.toggleFlatten} /> {/* Could also use layers & layers_clear */}
                    <Icon i={expanded ? 'arrow_drop_up' : 'arrow_drop_down'} onClick={this.toggleExpanded} />
                </div>

                { !expanded ? null :
                <div className="query">

                    <div className="tags">

                        <div className={`${not?'active ':''}not`} onClick={this.toggleNot}>Not</div>

                        <div className="options">
                            { statusTags.map(tag => (
                            <div key={tag}
                                className="tag"
                                data-value={not?`!${tag}`:tag}
                                onClick={this.addStatus}>
                                {tag[0].toUpperCase() + tag.slice(1)}
                            </div> ))}
                        </div>

                    </div>

                    <div className="status">

                        <span className="label">Include if:</span>

                        <div className="row">

                            {status.map((tag, i, list)=>add(tag, [i], list))}

                            <Icon i={'add'}
                                onClick={this.setPointer}
                                data-pointer={''}
                                className={pointer ? '' : 'active'}
                            />

                        </div>

                    </div>

                </div>}



            </div>
        );
    }

    updateSearch(e) {
        const { query, updateQuery } = this.props;
        updateQuery(query.set('search', e.target.value));
    }

    toggleFlatten() {
        const { query, updateQuery } = this.props;
        updateQuery(query.updateIn(['options', 'flatten'], v=>!v));
    }

    toggleExpanded() {
        this.setState({expanded: !this.state.expanded});
    }

    toggleNot() {
        this.setState({not: !this.state.not});
    }

    addStatus(e) {
        const { pointer } = this.state;
        const { query, updateQuery } = this.props;

        const newQuery = query.get('status') === undefined
            ? query.set('status', List())
            : query;
        const value = e.target.dataset.value;
        const path = pointer ? pointer.split(',') : [];

        updateQuery(newQuery.update('status', status => {
            return List.isList( status.getIn(path) )
                ? status.updateIn(path, v=>v.push(value))
                : status.updateIn(path, v=>List([v, value]));
        }));
    }

    removeStatus(e) {
        const { query, updateQuery } = this.props;
        let path = e.target.dataset.path.split(',');

        updateQuery(query.update('status', status => {
            const newStatus = status.removeIn(path);
            path.pop();
            if(path.length && newStatus.getIn(path).size === 1) {
                const item = newStatus.getIn([...path, 0]);
                if(!List.isList(item)) return newStatus.updateIn(path, v=>item);
                const index = path.pop();
                return newStatus.updateIn(path, v=>v.splice(index, 1, ...item))
            }
            return newStatus;
        }));

        this.setState({ pointer: '' });
    }

    setPointer(e) {
        const pointer = findData(e.target, 'pointer');
        if(pointer !== -1) this.setState({ pointer });
    }

    //////////   STATIC FUNCTIONS   //////////

    static filterItems({list:unfilteredList, tIndx, query, projectSizes} = {}) {
        if(!List.isList(unfilteredList) || unfilteredList.size === 0) return List();
        if(!Map.isMap(query)) return unfilteredList;
        tIndx = tIndx || Index(unfilteredList);

        const projectID = query.get('projectID');
        const list = projectID
            ? Filter.getDescendants({project:unfilteredList.get(tIndx[projectID]), list:unfilteredList, tIndx})
            : unfilteredList;

        const tasksBySearchAndStatus = Filter.byTask(query.remove('projectID'));
        const queriedTasks = list.filter(tasksBySearchAndStatus);

        const projectFilter = Filter.byProject({query, list:queriedTasks, projectSizes});
        const filteredProjects = list.filter(projectFilter);

        const filteredTasks = queriedTasks.filter(Filter.byParents(query));

        return filteredProjects.concat(filteredTasks);
    }

    static getDescendants({project, list, tIndx} = {}) {
        tIndx = tIndx || Index(list);

        let newList = [];
        let reference = {};

        project.get('childTasks').forEach(add);

        return List(newList);

        function add(ID) {
            const task = list.get( tIndx[ID] );
            if(task) {
                if(task.getIn(['is', 'project'])) task.get('childTasks').forEach(add);
                else if(!reference[ID]) {
                    reference[ID] = true;
                    newList.push(task);
                }
            }
        }
    }

    ///// FILTER BUILDERS /////

    static byProject({query, list, projectSizes} = {}) {
        if(!Map.isMap(query)) return item=>item.getIn(['is', 'project']);

        const checkParents = Filter.byParents(query);
        const checkSize = Filter.bySize({list, projectSizes});
        const checkSearch = Filter.bySearch(query);

        return item => (
            item.getIn(['is', 'project']) &&
            checkParents(item) &&
            (
                checkSize(item) ||
                (query.get('search') && checkSearch(item)) ||
                !(query.get('status') && query.get('status').size)
            )
        );
    }

    static byTask(query) {
        if(!Map.isMap(query)) return item=>!item.getIn(['is', 'project']);

        const checkParents = Filter.byParents(query);
        const checkSearch = Filter.bySearch(query);
        const checkStatus = Filter.byStatus(query);

        return item => (
            !item.getIn(['is', 'project']) &&
            checkParents(item) &&
            checkSearch(item) &&
            checkStatus(item)
        );
    }

    /**   bySize
     * Returns a filter that will reduce a number of projects down to only those with
     * one of more descendants in the provided list.
     * @param  {List} list - A list of tasks after being filtered by status and search
     * but prior to being filtered by parent.
     * @param {object} projectSizes - An optional object that will be mutated to record
     * the size of each project in {<id>:<size>} key/value pairs.
     * @return {func} - Returns a function that can be used as a filter.
     */
    static bySize({list, projectSizes} = {}) {
        return project => {
            const size = Filter.getDescendants({project, list}).size;
            if(typeof projectSizes === 'object') projectSizes[project.get('_id')] = size;
            return size;
        };
    }

    static byParents(query) {
        if(!Map.isMap(query)) return ()=>true;
        const projectID = query.get('projectID');
        const options = query.get('options');
        const flatten = options && options.get('flatten');
        if(flatten || projectID === undefined) return ()=>true;
        return item => projectID
            ? item.get('parentTasks').indexOf(projectID) !== -1
            : item.get('parentTasks').size === 0;
    }

    static bySearch(query) {
        if(!Map.isMap(query)) return ()=>true;
        const search = query.get('search');
        const options = query.get('options');
        if(!search) return ()=>true;
        const caseSensitive = options && options.get('caseSensitive');
        const searchString = caseSensitive ? search : search.toLowerCase();
        return item => caseSensitive
            ? item.get('title').indexOf(searchString) !== -1
            : item.get('title').toLowerCase().indexOf(searchString) !== -1;
    }

    static byStatus(query) {
        if(!Map.isMap(query)) return ()=>true;
        const status = query.get('status');
        if(!status) return ()=>true;

        const checkEvery = (item, stat) => List.isList(stat) ? stat.some(stat=>checkSome(item, stat)) : checkStat(item, stat);
        const checkSome = (item, stat) => List.isList(stat) ? stat.every(stat=>checkEvery(item, stat)) : checkStat(item, stat);
        const checkStat = (item, stat) => stat[0] === '!' ? !item.getIn(['is', stat.slice(1)]) : item.getIn(['is', stat]);

        return item => status.every(stat=>checkEvery(item, stat));
    }
}

// const { filterItems, getDescendants, byProject, byTask, bySize, byParents, bySearch, byStatus } = Filter;
// export { filterItems, getDescendants, byProject, byTask, bySize, byParents, bySearch, byStatus };

/*
    QUERY EXAMPLE:
    {
        projectID: "",
        search: "",
        status: fromJS([
            '!completed',
            [
                ['pending', 'highPriority'],
                'active'
            ],
            'starred'
        ]),
        options: Map({
            flatten: false,
            caseSensitive: false
        })
    }
*/

class old extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false
        };

        this.updateSearch = this.updateSearch.bind(this);
        this.handleEscape = this.handleEscape.bind(this);
    }

    render() {
        const { expanded } = this.state;
        const { search, count, bodyOffset } = this.props;

        const options = ['Active', 'Pending', 'Inactive', 'Completed', 'Scheduled', 'Project', 'Starred'];

        const offsetStyle = bodyOffset
            ? {
                zIndex: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,.34)'
            }
            : null;

        return (
            <div className="Filter" style={offsetStyle}>

                <div className="search row">
                    <div className="count">
                        <span>{count}</span>
                    </div>
                    <input type="text" value={search} onChange={this.updateSearch} onKeyDown={this.handleEscape} placeholder="Search..." />
                    <Icon i={expanded ? 'arrow_drop_up' : 'arrow_drop_down'} onClick={()=>this.setState({expanded: !expanded})} />
                </div>

                { !expanded ? null :
                <div className="query row">

                    <div className="included">
                        <span className="label">Include if:</span>
                        <div className="tags"></div>
                    </div>

                    <div className="excluded">
                        <span className="label">Exclude if:</span>
                        <div className="tags"></div>
                    </div>

                    <div className="options">
                        {options.map( (option, i) => <span key={i}>{option}</span> )}
                    </div>

                </div>}



            </div>
        );
    }

    updateSearch(e) {
        this.props.updateSearch(e.target.value);
    }

    handleEscape(e) {
        if(e.keyCode === 27) {
            e.target.value = "";
            e.target.blur();
            this.updateSearch(e);
        }
    }
}
