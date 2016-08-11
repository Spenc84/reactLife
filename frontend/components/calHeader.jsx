import React from 'react';
import { Column, Row, Icon, Span } from '../ui';

export default class calHeader extends React.Component {
    shouldComponentUpdate(nextProps) {
        this.props.month !== nextProps.month
    }
    render() {
        console.log('RENDERED: calHeader'); // __DEV__
        const { month, toggleOptionPane } = this.props;
        return (
            <header>
                <Column>
                    <Row style={{height: '70px'}} padding={1}>
                        <div style={{flexGrow: 1}}>
                            <Icon i={'menu'}
                                faded
                                size={2}
                                onClick={toggleOptionPane}
                            />
                            <Span size={2} style={{margin: "0 .5rem 0 1.5rem"}}>{month}</Span>
                            <Icon i={'arrow_drop_down'} />
                        </div>
                        <div>
                            <Icon i={'today'} faded style={} />
                            <Icon i={'list'} faded />
                        </div>
                    </Row>
                    <Row>
                        {/* <Calendar /> */}
                        body
                    </Row>
                </Column>
            </header>
        );
    }
}
