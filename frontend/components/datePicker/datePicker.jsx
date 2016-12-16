import React from 'react';
import moment from 'moment';

export default class DatePicker extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            date: props.date || moment().startOf('day').valueOf(),
            view: props.view || 'DAY'
        };

        this.showYears = this.showYears.bind(this);
        this.showMonths = this.showMonths.bind(this);
        this.showDays = this.showDays.bind(this);
    }

    render() {
        const { date:unix, view } = this.state;
        const date = moment(unix);
        const year = date.year();

        const headContent
            = (view === "YEAR") ? date.format('MMMM Y')
            : (view === "MONTH") ? year
            : `${Math.floor(year/10)*10} - ${Math.floor(year/10)*10+10}`;

        const headClick
            = (view === "YEAR") ? null
            : (view === "MONTH") ? this.showYears
            : this.showMonths;

        const bodyContent
            = (view === "YEAR") ? this.buildYears()
            : (view === "MONTH") ? this.buildMonths()
            : this.buildDays();

        return (
            <main id="Date_Picker">

                <header>
                    <Icon i="chevron_left" />
                    <span className="title" onClick={headClick}>
                        {headContent}
                    </span>
                    <Icon i="chevron_right" />
                </header>

                <div className="body">
                    {bodyContent}
                </div>

            </main>
        );
    }

    buildYears() {}
    buildMonths() {}
    buildDays() {}

    showYears() { this.setState({ view: "YEAR" }); }
    showMonths() { this.setState({ view: "MONTH" }); }
    showDays() { this.setState({ view: "DAY" }); }

    setYear(year) { this.setState({ date: moment(this.state.date).year(year).valueOf() }); }
    setMonth(month) { this.setState({ date: moment(this.state.date).year(year).valueOf() }); }
    setDay(day) { this.setState({ date: moment(this.state.date).year(year).valueOf() }); }

}
