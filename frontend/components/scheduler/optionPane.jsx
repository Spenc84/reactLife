import React, {PureComponent} from 'react';

// Props: options, updateProperty
export default class OptionPane extends PureComponent {
    constructor(props) {
        super(props);
        this.updateProperty = this.updateProperty.bind(this);
    }
    render() {
        return (
            <div className="options row">
            {
                this.props.options.map(({value, display}, index)=>(

                    <div key={index}
                        className="option"
                        onClick={this.updateProperty}
                        data-content={display}>

                        <div value={value}>{display}</div>

                    </div>

                ))
            }
            </div>
        );
    }
    updateProperty(e) {
        const value = e.target.getAttribute('value');
        if(typeof this.props.updateProperty === 'function') this.props.updateProperty(value)
    }
}
