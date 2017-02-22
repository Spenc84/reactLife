import './rows.styl';
import React from 'react';
import { Icon } from '../ui';

export function TitleRow({index, id, onClick, item}) {
    return (
        <div
            className="Title Row"
            data-index={index}
            data-id={id}
            onClick={onClick}
        >
            <Icon i={item.getIn(['is','project']) ? 'group_work' : 'fiber_manual_record'} />
            <span>{item.get('title')}</span>
        </div>
    );
}
