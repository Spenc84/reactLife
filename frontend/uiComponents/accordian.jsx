import React from 'react';
import ExpansionPanel from './expansionPanel/expansionPanel';
import { Map, List, fromJS } from 'immutable';

export default class Accordian extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { open: -1 };
    }

    render() {
        if(!List.isList(this.props.data) || this.props.data.size === 0) return null;
        return <div className="Accordian">
            {this.props.data.map(
                (props, index) => {
                    return (
                        <ExpansionPanel key={index}
                            {...props}
                            expanded={index === this.state.open}
                            togglePanel={this.togglePanel.bind(this, index)}
                        />
                    );
                }
            )}
        </div>
    }

    togglePanel(index) {
        if(index === this.state.open) this.setState({ open: -1 });
        else this.setState({ open: index });
    }
}

Accordian.propTypes = {
    data: React.PropTypes.instanceOf(List).isRequired
}
