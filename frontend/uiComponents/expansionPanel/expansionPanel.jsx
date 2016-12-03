import './expansionPanel.styl';
import React, { PropTypes, Component } from "react";
import { Icon, Button } from "../ui";


export default class ExpansionPanel extends Component {
	constructor(props) {
		super(props);

		this.state = { expanded: false };

		this.expandPanel = this.expandPanel.bind(this);
		this.collapsePanel = this.collapsePanel.bind(this);
	}

	render() {
		const { expanded } = this.state;
        const { label, title, value, className, isModified, disabled, onSave, onCancel } = this.props;

		const panelClasses = (className) ? `${className} ExpansionPanel` : "ExpansionPanel";
        const panelStyle = (expanded) ? {margin:"1.33rem 0"} : null;
        const togglePanel = (expanded) ? this.collapsePanel : this.expandPanel;
        const icon = (expanded) ? 'expand_less' : 'expand_more';
		const hideFooter = this.props.hideFooter || !(typeof onSave === 'function' && typeof onCancel === 'function');
		const collapsableBody = (expanded) ? null : {display: 'none'};
        const collapsableFooter = (expanded) ? null : {display: 'none'};

		return(
			<div className={panelClasses} style={panelStyle}>

				<div className="header" onClick={togglePanel} title={title || ""}>
					<div className="label">{label}</div>
					<div className="value">{value}</div>
					<Icon i={icon} fluid />
				</div>


				<div className="body" style={collapsableBody}>
                    {this.props.children}
                </div>

				{(hideFooter) ?	null
				:	<div className="footer" style={collapsableFooter}>
						{(isModified)
							? [
								<Button
									key={1}
									label="CANCEL"
									title="Cancel"
									onClick={onCancel} />,

								<Button
									key={2}
									label="SAVE"
									title="Save Changes"
									disabled={disabled}
									onClick={onSave} />
							]

							:   <Button
									label="DONE"
									title="Close"
									onClick={this.collapsePanel} />
						}
	                </div>
				}

			</div>
		);
	}

	expandPanel() {
        const { onOpen } = this.props;
		if(typeof onOpen === 'function') onOpen();
		this.setState({ expanded: true });
    }

    collapsePanel() {
		const { onClose } = this.props;
		if(typeof onClose === 'function') onClose();
		this.setState({ expanded: false });
    }
}
