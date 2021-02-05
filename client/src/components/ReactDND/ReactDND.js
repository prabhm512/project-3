import React, { useEffect, useState } from 'react';

// react-beautiful-dnd
import '@atlaskit/css-reset';
import { DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';

// Utils
import UpdateToDoContext from '../../utils/contexts/UpdateToDoContext';
import API from '../../utils/apis/API';

// Styling
import styled from 'styled-components';
import './ReactDND.css';

const Container = styled.div`
  display:flex;
`

function ReactDND(props) {

  // Used when task is moved in to the 'Puased' & 'Done' columns to record time for current day.
  // One task may be worked on for multiple days
  let dayToday = new Date().getDay();

  const [ DND, setDND ] = useState(initialData);

  useEffect(() => {
    // Load tasks on component mount
    loadTasks(props.userID);
  }, []);
  
  // Updates state to reflect drag & drop result
  const onDragEnd = result => {
    const { destination, source, draggableId } = result

    // Exit if task dragged outside of a droppable
    if (!destination) {
      return
    }

    // Check whether location of draggable changed
    // Users may put draggable back into the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const start = DND.columns[source.droppableId]
    const finish = DND.columns[destination.droppableId]

    // Moving tasks to a different position in the same column
    if (start === finish) {
      const updatedTaskIds = Array.from(start.taskIds)
      updatedTaskIds.splice(source.index, 1)
      updatedTaskIds.splice(destination.index, 0, draggableId)

      const newColumn = {
        ...start,
        taskIds: updatedTaskIds
      }

      const newState = {
        ...DND,
        columns: {
          ...DND.columns,
          [newColumn.id]: newColumn
        }
      }

      // Do not set state inside method that does an axios call as task movement lags.
      setDND(newState);
      updateUserBoard(newState);
      return
    }

    // Moving tasks from 1 column to another
    // Do not allow task to move back to 'To Do' column once it has been moved out
    if ((start.id !== 'column-2' || start.id !== 'column-3' || start.id !== 'column-4') && finish.id !== 'column-1') {
      const startTaskIds = Array.from(start.taskIds)
        startTaskIds.splice(source.index, 1)
        const newStart = {
          ...start,
          taskIds: startTaskIds
      }
  
      const finishTaskIds = Array.from(finish.taskIds)
        finishTaskIds.splice(destination.index, 0, draggableId)
        const newFinish = {
          ...finish,
          taskIds: finishTaskIds
      }
    
      let newState = {
        ...DND,
        columns: {
          ...DND.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish
        }
      }

      // Record the date task was moved into 'In Progress' column
      if (finish.id === 'column-2') {

        newState = {
          ...DND, 
          tasks: { 
            ...DND.tasks,
            [draggableId]: { ...DND.tasks[draggableId], inProgressDate: Date.now() }
          },
          columns: {
            ...DND.columns,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish
          }
        }
        console.log(newState);
      } 

      // Record the date task was moved FROM 'In Progress' column into 'Paused' column 
      else if (finish.id === 'column-3' && start.id === 'column-2')  {

        let taskTime;
        let totalTaskTime = 0;

        // Calculate exact time (in miilliseconds) that task was in 'In Progress' column
        if (DND.tasks[draggableId].inProgressDate !== 0) {
          taskTime = Date.now() - DND.tasks[draggableId].inProgressDate;
        }

        const timeInSeconds = Math.round(taskTime / 1000);
      
        // Calculate total time it took to complete task
        for (let i=1; i<6; i++) {
          totalTaskTime += DND.tasks[draggableId].timesheet[i];
        }
        totalTaskTime+=timeInSeconds;

        newState = {
          ...DND, 
          tasks: { 
            ...DND.tasks,
            [draggableId]: { ...DND.tasks[draggableId], pausedDate: Date.now(), timesheet: { ...DND.tasks[draggableId].timesheet, [`${dayToday}`]: DND.tasks[draggableId].timesheet[dayToday] + timeInSeconds }, totalTaskTime: totalTaskTime }
          },
          columns: {
            ...DND.columns,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish
          }
        } 
      }

      // Record the date task was moved FROM 'In Progress' column into 'Done' column 
      else if (finish.id === 'column-4'  && start.id === 'column-2') {

        let taskTime;
        let totalTaskTime=0;

        // Calculate exact time (in miilliseconds) that task was in 'In Progress' column
        if (DND.tasks[draggableId].inProgressDate !== 0) {
          taskTime = Date.now() - DND.tasks[draggableId].inProgressDate;
        }

        const timeInSeconds = Math.round(taskTime / 1000);

        // Calculate total time it took to complete task
        for (let i=1; i<6; i++) {
          totalTaskTime += DND.tasks[draggableId].timesheet[i];
        }
        totalTaskTime+=timeInSeconds;

        newState = {
          ...DND, 
          tasks: { 
            ...DND.tasks,
            [draggableId]: { ...DND.tasks[draggableId], doneDate: Date.now(), timesheet: { ...DND.tasks[draggableId].timesheet, [`${dayToday}`]: DND.tasks[draggableId].timesheet[dayToday] + timeInSeconds }, totalTaskTime: totalTaskTime }
          },
          columns: {
            ...DND.columns,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish
          }
        } 
      }
      // console.log(newState);
      // Do not set state inside method that does an axios call as task movement lags.
      setDND(newState);
      updateUserBoard(newState);
    }
  } 

  // Add new task to To do list 
  const addNewTask = () => {
    const storeAllIDs = [];
    let newTaskID;

    // Loop through initial data to find out value of last key
    for (let key in DND.tasks) {
      if (DND.tasks.hasOwnProperty(key)) {
          // console.log(`${key} : ${DND.tasks[key].content}`);
          storeAllIDs.push(key.slice(-1));
      }
    }
    
    if (storeAllIDs.length !== 0) {
      newTaskID = `task-${parseInt(Math.max(...storeAllIDs)) + 1}`;
    } else {
      newTaskID = 'task-1';
    }

    if (document.querySelector('.inputNewTaskContent').value !== "") {

      // Add new task
      // New timer instantiated on creation of new task
      DND.tasks[newTaskID] = { id: newTaskID, content: document.querySelector('.inputNewTaskContent').value, inProgressDate: 0, pausedDate: 0, doneDate: 0, timesheet: {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0}, totalTaskTime: 0 };

      // ID of new task gets inserted into first column
      const newToDos = {
        _id: props.userID,
        tasks: { ...DND.tasks },
        columns: {
          'column-1': {
            id: 'column-1',
            title: 'To do',
            taskIds: [newTaskID, ...DND.columns['column-1'].taskIds]
          },
          'column-2': {
            id: DND.columns['column-2'].id,
            title: DND.columns['column-2'].title,
            taskIds: [...DND.columns['column-2'].taskIds]
          },
          'column-3': {
            id: DND.columns['column-3'].id,
            title: DND.columns['column-3'].title,
            taskIds: [...DND.columns['column-3'].taskIds]
          },
          'column-4': {
            id: DND.columns['column-4'].id,
            title: DND.columns['column-4'].title,
            taskIds: [...DND.columns['column-4'].taskIds]
          },            
        },
        columnOrder: [...DND.columnOrder],
      }
      // Do not set state inside method that does an axios call as task movement lags.
      setDND(newToDos);
      updateUserBoard(newToDos);

      // console.log(newToDos);
      document.querySelector('.inputNewTaskContent').value = "";
    }
  }

  // Called from component inside task.js (2 levels down). Allows task content to be edited
  const editTaskContent = (taskID, content) => {
    const newState = {
      ...DND, 
      tasks: {
        ...DND.tasks,
        [taskID]: { ...DND.tasks[taskID], content: content}
      }
    }

    setDND(newState);
    updateUserBoard(newState);
  }

  // Called from component inside task.js (2 levels down). Allows task to be deleted
  const deleteTask = (taskID) => {
    // console.log(taskID);
    delete DND.tasks[taskID];

    // Delete task from columns object as well
    for (let key in DND.columns) {
      DND.columns[key].taskIds.forEach((el, idx) => {
        if (el === taskID) {
          DND.columns[key].taskIds.splice(idx, 1);
        }
      })
    }
    // console.log(DND);
    const newState = {
      ...DND
    };

    setDND(newState);
    updateUserBoard(newState);
  }

  // Get all tasks of the logged in user
  const loadTasks = (userID) => {
    // console.log(userID);
    API.getUserBoard(userID)
    .then(res => {
      // console.log(res);
      setDND(res.data)
    })
    .catch(err => console.log(err));
  }

  // Post task to /api/tasks route
  const updateUserBoard = (taskData) => {
    API.updateUserBoard(taskData)
    .catch(err => console.log(err));
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
          {DND.columnOrder.map(columnId => {
            const column = DND.columns[columnId]
            const tasks = column.taskIds.map(
                taskId => DND.tasks[taskId]
          )

          return (
            <UpdateToDoContext.Provider value={addNewTask} key={column.id}>
              <Column column={column} tasks={tasks} userID={props.userID} currState={DND} editTaskContentCB={editTaskContent} deleteTaskCB={deleteTask}/>
            </UpdateToDoContext.Provider>
          )
        })}
      </Container>
    </DragDropContext>
  )
}

export default ReactDND;
