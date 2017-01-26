import './taskDetails.styl';
import React, { PureComponent } from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import Scheduler from '../../components/scheduler/scheduler';
import { Icon, Button, Text, TextArea } from '../../uiComponents/ui';
import { buildOperation } from '../../components/tools';
import { getDefaultTask } from '../../defaults';


// ----- PLACEHOLDERS -----
let TYPE;           // <['NEW', 'NEW_PROJECT', null]>
let TASK = Map();   // Original state of task
let ON_CLOSE;       // Callback function to be executed when task is successfully closed
let ON_SAVE;       // Callback function to be executed when task is successfully saved


// PROPS: createNewTask, updateTasks, deleteTasks, modifySelected
export default class TaskDetails extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            task: TASK,
            open: false
        };

        this.open = this.open.bind(this);
        this.confirmClose = this.confirmClose.bind(this);
        this.close = this.close.bind(this);

        this.handleFormChange = this.handleFormChange.bind(this);
        this.updateSchedule = this.updateSchedule.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.toggleStarred = this.toggleStatus.bind(this, 'starred');
        this.toggleCompleted = this.toggleStatus.bind(this, 'completed');
    }

    render() {
        const { task, open } = this.state;

        const completed = task.getIn(['status', 'completed']);
        const starred = task.getIn(['status', 'starred']);

        console.log('RENDERED: --- TASK_DETAILS ---'); // __DEV__
        return (
            <main className={`${open?'':'hidden '}TaskDetails`}>

                <header className="task_details">

                    <Icon i={"arrow_back"} onClick={this.confirmClose} size={1.25}/>
                    <div className="functional icons">
                        <Icon i={'delete'} onClick={this.deleteTask} hidden={TYPE === 'NEW'} />
                        {/* <Icon i={'group_work'} onClick={this.createProject} />
                        <Icon i={'linear_scale'} />
                        <Icon i={'info'} />
                        <Icon i={'group_add'} />
                        <Icon i={'schedule'} onClick={openScheduler} /> */}
                        <Icon i={'star'} onClick={this.toggleStarred} className={starred?'starred':''} />
                        {/* <Icon i={'more_vert'} /> */}
                    </div>
                    <Icon i={'check_circle'} onClick={this.toggleCompleted} size={1.25} className={completed?'completed':''} />
                    <Button light
                        label={'SAVE'}
                        title={'Save changes'}
                        onClick={this.saveChanges}
                        disabled={TASK === task}
                    />

                </header>

                <div className="body">

                    <div className="title row">
                        <span className="label">Title:</span>
                        <TextArea
                            data-content="title"
                            value={task.get('title') || ""}
                            onChange={this.handleFormChange}
                        />
                    </div>

                    <div className="description row">
                        <span className="label">Description:</span>
                        <TextArea
                            data-content="description"
                            value={task.get('description') || ""}
                            onChange={this.handleFormChange}
                        />
                    </div>

                    <div className="color row">
                        <span className="label">Color:</span>
                        <input type="color"
                            data-content="color"
                            value={task.get('color') || '#0078ff'}
                            onChange={this.handleFormChange}
                        />
                    </div>

                    <div className="schedule row">
                        <span className="label">Schedule:</span>
                        <Scheduler ref={ref=>this.Scheduler=ref}
                            schedule={task.get('schedule')}
                            updateSchedule={this.updateSchedule}
                        />
                    </div>

                </div>

            </main>
        );
    }

    open({type, task, onClose, onSave} = {}) {

        TYPE = type;
        TASK = type === 'NEW' ? getDefaultTask() : task;
        ON_CLOSE = onClose;
        ON_SAVE = onSave;

        this.setState({
            task,
            open: true
        });

    }

    confirmClose() {
        const { task } = this.state;
        if( task === TASK ) this.close();
        else if( confirm("Discard changes?") ) this.close();
    }

    close() {
        TYPE = null;
        TASK = Map();
        ON_CLOSE = null;
        ON_SAVE = null;

        this.Scheduler.Accordian.reset();

        this.setState({
            task: TASK,
            open: false
        });

        if(typeof ON_CLOSE === 'function') ON_CLOSE();
    }

    handleFormChange(e) {
        const { task } = this.state;

        const field = e.target.dataset.content;
        const value = e.target.value;

        this.setState({
            task: task.setIn(field.split('.'), value)
        });
    }

    updateSchedule(newSchedule) {
        const { task } = this.state;

        this.setState({
            task: task.set('schedule', newSchedule)
        });
    }

    saveChanges() {
        const { task } = this.state;
        const { createNewTask, updateTasks } = this.props;

        // Update Scheduled status
        let newTask = task;
        const startTime = newTask.getIn(['schedule', 'startTime']);
        if(startTime !== TASK.getIn(['schedule', 'startTime'])) {
            newTask = newTask.withMutations(
                task => task
                    .setIn(['status', 'scheduled'], !!startTime)
                    .setIn(['status', 'active'], moment().isSameOrAfter(startTime))
                    .setIn(['status', 'pending'], moment().isBefore(startTime))
                    .setIn(['status', 'inactive'], !startTime)
            );
        }

        switch(TYPE) {

            case 'NEW':

                const wasScheduled = TASK.getIn(['status', 'scheduled']);
                const isScheduled = newTask.getIn(['status', 'scheduled']);

                if( wasScheduled !== isScheduled ) {
                    newTask = newTask.setIn(
                        ['changeLog', 0, 'display'],
                         isScheduled ? 'Created and scheduled task' : 'Created task'
                    );
                }

                createNewTask(newTask);
                if(typeof ON_SAVE === 'function') ON_SAVE();
                this.close();

            break;

            default:

                const pendingTasks = [task.get('_id')];

                let ACTIONS = [{
                    action: 'MODIFY',
                    pendingTasks,
                    operation: buildOperation(newTask, TASK),
                }];

                if(newTask.get('schedule') !== TASK.get('schedule')) ACTIONS.push({
                    action: 'SCHEDULE',
                    pendingTasks: [task.get('_id')]
                });

                updateTasks(ACTIONS);

                TASK = newTask;
                if(newTask === task) this.forceUpdate();
                else this.setState({task:newTask});

                if(typeof ON_SAVE === 'function') ON_SAVE();

            break;

        }
    }

    deleteTask() {
        const ID = TASK.get('_id');
        this.props.deleteTasks( List([ID] ), () => {
            this.props.modifySelected(
                selectedTasks => {
                    const index = selectedTasks.findIndex( id => id === ID );
                    return index === -1 ? selectedTasks : selectedTasks.delete(index);
                },
                selectedProject => selectedProject && selectedProject.get('_id') === ID ? null : selectedProject
            );
            this.close();
        });
    }

    toggleStatus(key) {
        const { task } = this.state;
        const value = !task.getIn(['status', key]);
        this.setState({
            task: task.setIn(['status', key], value)
        });
    }
}
