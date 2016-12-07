import React from 'react';

export default class Tooltip extends React.Component {
    constructor(props) {
        super(props);

        this.state = { open: false };

        this.openTooltip = this.openTooltip.bind(this);
        this.closeTooltip = this.closeTooltip.bind(this);
    }

    render() {
        const { x, y, open } = this.state;

        const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        const positionedOnTop = (h-y < 475);
        const hidePointer = (positionedOnTop && y < 475)

        const left = (x < 150) ? 0 : (w-x < 150) ? `${w-300}px` : `${x-150}px`;
        let top = (positionedOnTop) ? Math.max(y-475, 0) : y+25;

        const pointerStyle = { left: `${x-15}px`, top: `${y+10}px` };
        if(positionedOnTop) {
            pointerStyle.top = `${y-25}px`;
            pointerStyle.borderTop = '15px solid rgb(17,93,142)';
            pointerStyle.borderBottom = 'none';
        }

        return (
            <div className={(open)?'open tooltip':'closed tooltip'}
                    style={{top: top, left: left}}>

                {(hidePointer)
                    ? null
                    : <span className="pointer" style={pointerStyle} />}

                {this.props.children}
            </div>
        );
    }

    openTooltip(e) {
        if(!this.state.open) document.addEventListener('click', this.shouldTooltipClose, true);

        this.setState({open: true, x: e.clientX, y: e.clientY});
        e.stopPropagation();
    }

    shouldTooltipClose(e) {
        e = e || window.event;
        const target = e.target || e.srcElement;
        let pEl = target;
        if (!target) return;

        do { if (hasClass(pEl, 'Tooltip')) return; }
        while ((pEl = pEl.parentNode));

        this.closeTooltip();
    }

    closeTooltip() {
        this.setState({ open: false });
        document.removeEventListener('click', this.shouldTooltipClose, true);
    }

    stopPropigation(e) {
        e.stopPropigation();
    }
}
