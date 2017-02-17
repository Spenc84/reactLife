import './picker.styl';
import React, {PureComponent, PropTypes} from 'react';
import { Map, List, fromJS } from 'immutable';

import ListComponent from '../list/list';
import Modal from '../../uiComponents/modal/modal';
import { Icon } from '../../uiComponents/ui';
import { mergeObj } from '../tools';


// DEFAULT
const DEFAULT = {
    list1: {
        component: ListComponent,
        props: {
            title: 'Available',
            data: List(),
            includeFilter: true
        }
    },
    list2: {
        component: ListComponent,
        props: {
            title: 'Selected',
            data: List(),
            includeFilter: false
        }
    },
    action: {
        label: 'SAVE',
        title: 'No save function assigned',
        colored: true,
        onClick: null
    }
};

// PLACEHOLDERS
let PROPS = DEFAULT;

export default class Picker extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            available: List(),
            selected: List()
        };

        // External API
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);

        // Internal methods
        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
        this.save = this.save.bind(this);
    }

    render() {
        const { available, selected } = this.state;
        const {
            list1:{ component:FromList, props:fromProps },
            list2:{ component:ToList, props:toProps },
            action:{
                label:actionLabel,
                title:actionTitle,
                colored:actionColor,
                onClick:actionClick
            }
        } = PROPS;

        // const filtered = AVAILABLE.filterNot(a=>selected.some(b=>b.get('_id') === a.get('_id')));

        const actions = [
            {
                label: 'CANCEL',
                onClick: this.close
            },
            {
                label: actionLabel,
                title: actionTitle,
                colored: actionColor,
                disabled: selected.equals(toProps.data),
                onClick: actionClick ? this.save : null
            }
        ];

        return (
            <Modal ref={ref=>this.Modal=ref}
                footer={actions}
            >
                <main className="Picker">

                    <FromList {...fromProps}
                        data={available}
                        onRowClick={this.select}
                    />
                    {/* <div className="available column">
                        <header> Available </header>

                        <div className="expanded column">
                            <div className="filter">
                                <div className="count">
                                    <span>{available.size}</span>
                                </div>
                                <input type='text' placeholder="Search..." />
                                <Icon i={'arrow_drop_down'} />
                            </div>
                            {available.map((item, i)=>(
                                <div key={i}
                                    data-index={i}
                                    className="available item"
                                    onClick={this.select}
                                >
                                    <Icon i={item.getIn(['is','project']) ? 'group_work' : 'fiber_manual_record'} />
                                    <span>{item.get('title')}</span>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    <ToList {...toProps}
                        data={selected}
                        onRowClick={this.deselect}
                    />
                    {/* <div className="selected column">
                        <header> Selected </header>

                        <div className="expanded column">
                            {selected.map((item, i)=>(
                                <div key={i}
                                    data-index={i}
                                    className="selected item"
                                    onClick={this.deselect}
                                >
                                    <Icon i={item.getIn(['is','project']) ? 'group_work' : 'fiber_manual_record'} />
                                    <span>{item.get('title')}</span>
                                </div>
                            )).toJS()}
                        </div>
                    </div> */}

                </main>
            </Modal>
        );
    }



    open(props) {
        if( !Picker.validateInput(props) ) return;
        PROPS = mergeObj(DEFAULT, props);

        this.setState({
            available: PROPS.list1.props.data,
            selected: PROPS.list2.props.data
        });

        this.Modal.open();
    }

    close() {
        PROPS = DEFAULT;
        this.Modal.close();
    }


    select(e) {
        const { available, selected } = this.state;
        const i = findIndex(e.target);
        if(i !== -1) this.setState({
            available: available.remove(i),
            selected: selected.push(available.get(i))
        });
    }

    deselect(e) {
        const { available, selected } = this.state;
        const i = findIndex(e.target);
        if(i !== -1) this.setState({
            available: available.push(selected.get(i)),
            selected: selected.remove(i)
        });
    }

    save() {
        PROPS.action.onClick(this.state.selected);
        this.close();
    }

    static validateInput(props) {
        if(typeof props !== 'object') return console.warn(`Invalid argument type (${typeof props}) passed into <Picker>'s 'open( props:<obj> )' method.`) && false;
        if(List.isList(props.list1)) props.list1 = { props: { data: props.list1 }};
        if(List.isList(props.list2)) props.list2 = { props: { data: props.list2 }};
        if(typeof props.action === 'function') props.action = { onClick: props.action };
        return true;
    }
}

export function findIndex(elem) {
    if(elem.dataset.index === undefined) return elem.parentElement ? findIndex(elem.parentElement) : -1;
    return elem.dataset.index;
}
