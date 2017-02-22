import './picker.styl';
import React, {PureComponent, PropTypes} from 'react';
import { Map, List, fromJS } from 'immutable';

import { FilteredList, FixedList } from '../lists/lists';
import Modal from '../../uiComponents/modal/modal';
import { Icon } from '../../uiComponents/ui';
import { mergeObj } from '../tools';


// DEFAULT
const DEFAULT = {
    list1: {
        title: 'Available',
        component: FilteredList,
        props: {
            data: List()
        }
    },
    list2: {
        title: 'Selected',
        component: FixedList,
        props: {
            data: List()
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
            toData: List()
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
        const { toData } = this.state;

        const {
            list1:{ title:fromTitle, component:FromList, props:fromProps },
            list2:{ title:toTitle, component:ToList, props:toProps },
            action:{
                label:actionLabel,
                title:actionTitle,
                colored:actionColor,
                onClick:actionClick
            }
        } = PROPS;

        const actions = [
            {
                label: 'CANCEL',
                onClick: this.close
            },
            {
                label: actionLabel,
                title: actionTitle,
                colored: actionColor,
                disabled: toData.equals(toProps.data),
                onClick: actionClick ? this.save : null
            }
        ];

        const fromData = fromProps.data.filterNot(a => toData.some(b => b.get('_id') === a.get('_id')));

        console.log('RENDERED:  --- PICKER ---'); // __DEV__
        return (
            <Modal ref={ref=>this.Modal=ref}
                footer={actions} >

                <main className="Picker">

                    <section className="from">

                        { fromTitle
                            ? <header> {fromTitle} </header>
                            : null
                        }

                        <FromList {...fromProps}
                            data={fromData}
                            onRowClick={this.select}
                        />

                    </section>

                    <section className="to">

                        { toTitle
                            ? <header> {toTitle} </header>
                            : null
                        }

                        <ToList {...toProps}
                            data={toData}
                            onRowClick={this.deselect}
                        />

                    </section>

                </main>

            </Modal>
        );
    }

    open(props) {
        if( !Picker.validateInput(props) ) return;
        PROPS = mergeObj(DEFAULT, props);

        if(PROPS.list2.props.data === this.state.toData) this.forceUpdate();
        else this.setState({
            toData: PROPS.list2.props.data
        });

        this.Modal.open();
    }

    close() {
        PROPS = DEFAULT;
        this.Modal.close();
    }


    select(e) {
        const { toData } = this.state;
        const fromData = PROPS.list1.props.data;

        const ID = findID(e.target);
        const item = fromData.find(x => x.get('_id') === ID);

        if(item) this.setState({
            toData: toData.push(item)
        });
    }

    deselect(e) {
        const { toData } = this.state;

        const ID = findID(e.target);
        const i = toData.findIndex(x => x.get('_id') === ID);

        if(i !== -1) this.setState({
            toData: toData.remove(i)
        });
    }

    save() {
        PROPS.action.onClick(this.state.toData);
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

export function findID(elem) {
    if(elem.dataset.id === undefined) return elem.parentElement ? findID(elem.parentElement) : -1;
    return elem.dataset.id;
}
