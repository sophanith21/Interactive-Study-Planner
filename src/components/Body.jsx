import circle from "../assets/circle.svg";
import circle_click from "../assets/circle-click.svg";
import task from "../assets/Add_task.svg";
import chevronDown from "../assets/Chevron down.svg";
import chevronDown_Dark from "../assets/Chevron down_black.svg";
import { formatDistanceToNow } from "date-fns";
import DatePicker from "react-datepicker";
import { useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import "react-datepicker/dist/react-datepicker.css";

export default function Body() {
  //================================== Body's States & Variables ==================================

  // Load task data from localStorage or initialize an empty array
  const [taskData, setTaskData] = useState(() => {
    const storedTasks = localStorage.getItem("Tasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  // UI state for sorting and toggling views
  const [isAllTaskClick, setAllTaskClick] = useState(false);
  const [isSortByDeadline, setIsSortedByDeadline] = useState(false);
  const [isSortedByImportance, setIsSortedByImportance] = useState(false);

  // Template for a new task
  const newTask = {
    title: "new task",
    desc: "description",
    deadline: null,
    complete: false,
    isImportant: false,
  };

  // Style the selected sort in <li>
  const selectedSortStyle = {
    color: "black",
    backgroundColor: "wheat",
    borderRadius: "0.6rem",
  };

  //================================== Body Event Handlers ==================================

  //Add a new task to the list
  const handleAddNewTask = (e) => {
    e.preventDefault();
    setTaskData([...taskData, { id: taskData.length + 1, ...newTask }]);
    console.log(taskData);
  };

  // Update a task field (e.g., title, description, importance)
  const handleTaskUpdate = (taskId, updateField) => {
    setTaskData((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updateField } : task
      )
    );
  };

  // Update the deadline for a specific task
  const updateTaskDeadline = (taskId, newDate) => {
    setTaskData((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, deadline: newDate } : task
      )
    );
  };

  // Remove a task from the list and reassing IDs
  const removeTask = (taskId) => {
    setTaskData(
      (prevTasks) =>
        prevTasks
          .filter((item) => item.id !== taskId) // Remove the task
          .map((task, index) => ({ ...task, id: index + 1 })) // Reassign sequential IDs
    );
  };

  // Sort tasks by deadline (earliest first, undefine is also first)
  const sortByDeadline = (tasks) => {
    return tasks.sort((a, b) => {
      const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
      const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
      return dateA - dateB;
    });
  };

  // Sort tasks by importance
  const sortByImportance = (tasks) => {
    return tasks.sort((a, b) => b.isImportant - a.isImportant);
  };

  // Apply sorting based on the selected criteria
  const sortTasks = () => {
    let sortedTasks = [...taskData];
    if (isSortByDeadline) {
      sortedTasks = sortByDeadline(sortedTasks);
    } else if (isSortedByImportance) {
      sortedTasks = sortByImportance(sortedTasks);
    } else {
      sortedTasks = sortedTasks.sort((a, b) => a.id - b.id); // Default sort by id
    }
    setTaskData(sortedTasks);
  };

  //================================== useEffects ==================================

  // Re-sort whenever the sorting state changes
  useEffect(() => {
    sortTasks(); // Re-sort whenever the sorting state changes
  }, [isSortByDeadline, isSortedByImportance]);

  // Store updated task list in localStorage
  useEffect(() => {
    localStorage.setItem("Tasks", JSON.stringify(taskData));
  }, [taskData]);

  return (
    <>
      <div className="list-container">
        <div
          className="all-tasks"
          onClick={() => setAllTaskClick((prev) => !prev)}
          style={
            isAllTaskClick
              ? {
                  backgroundColor: "gray",
                  color: "black",
                  border: "0.3rem solid white",
                }
              : {
                  border: "0.3rem solid white",
                }
          }
        >
          <h2>
            {(isSortByDeadline && "Deadline") ||
              (isSortedByImportance && "Important") ||
              "All Tasks"}
          </h2>
          <img
            src={isAllTaskClick ? chevronDown_Dark : chevronDown}
            alt="drop-down"
            style={
              isAllTaskClick
                ? {
                    transform: "rotate(180deg)",
                    transition: "transform 0.3s ease",
                  }
                : {
                    transition: "transform 0.3s ease",
                  }
            }
          />
        </div>
        {isAllTaskClick && (
          <ul
            style={{
              left: "10%",
              top: "25%",
              position: "absolute",
              zIndex: "1000",
              padding: "1rem 2rem",
            }}
          >
            <li
              onClick={() => {
                setIsSortedByDeadline((prev) => !prev);
                setIsSortedByImportance(false);
                setAllTaskClick((prev) => !prev);
              }}
              style={isSortByDeadline ? selectedSortStyle : { color: "black" }}
            >
              Sort By Deadline
            </li>
            <li
              onClick={() => {
                setIsSortedByImportance((prev) => !prev);
                setIsSortedByDeadline(false);
                setAllTaskClick((prev) => !prev);
              }}
              style={
                isSortedByImportance ? selectedSortStyle : { color: "black" }
              }
            >
              Sort By Importance
            </li>
          </ul>
        )}
      </div>

      <div className="task-container">
        {taskData.map((t) => (
          <Task
            key={t.id}
            data={t}
            onEdit={handleTaskUpdate}
            updateDeadline={updateTaskDeadline}
            onRemove={removeTask}
          />
        ))}

        <div className="add-task">
          <button onClick={handleAddNewTask}>
            <img src={task} alt="add-task" /> <h2>Add new task</h2>
          </button>
        </div>
      </div>
    </>
  );
}

//================================== Child Component : Task ==================================

function Task({ data, onEdit, updateDeadline, onRemove }) {
  //================================== Task's States & Variables ==================================

  // Task-specific state for UI interactions
  const [datePickerState, setDatePickerState] = useState(false);

  //================================== Task's Event Handlers ==================================

  // Handle date-picker when clicked (if task is not completed)
  function handleDateChanging() {
    if (!data.complete) {
      setDatePickerState((prev) => !prev);
    }
  }

  // Handle text input changes (title & description)
  const handleInput = (e) => {
    onEdit(data.id, { [e.target.name]: e.target.value }); // Update state
  };

  // Handle task completion status
  const handleCircleClick = (e) => {
    e.preventDefault();
    onEdit(data.id, { complete: !data.complete }); // Pass updated value to parent state
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className={data.complete ? "task-completed" : "task"}
          id={data.isImportant ? "important" : ""}
        >
          <div className="task-left">
            <img
              src={data.complete ? circle_click : circle}
              alt="Done"
              onClick={handleCircleClick}
            />
            <div className="task-text">
              <input
                name="title"
                type="text"
                value={data.title}
                onChange={handleInput}
              />
              <textarea name="desc" value={data.desc} onChange={handleInput} />
            </div>
          </div>
          <div className="task-right">
            <h3
              onClick={handleDateChanging}
              style={{
                color:
                  data.deadline && new Date(data.deadline) < new Date()
                    ? "red"
                    : "black",
              }}
            >
              {!datePickerState &&
                (data.deadline
                  ? formatDistanceToNow(new Date(data.deadline), {
                      addSuffix: true,
                    })
                  : "No deadline")}
            </h3>
            <h3>
              {datePickerState && !data.complete && (
                <DatePicker
                  name="deadline"
                  showTimeSelect
                  selected={data.deadline ? new Date(data.deadline) : null}
                  onChange={(e) => updateDeadline(data.id, e.toISOString())}
                  onClickOutside={() => setDatePickerState(false)}
                  onSelect={() => setDatePickerState(false)}
                />
              )}
            </h3>
          </div>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Content className="context-menu">
        <ContextMenu.Item
          onSelect={() => onEdit(data.id, { isImportant: !data.isImportant })}
        >
          {data.isImportant ? "[1] Set as Unimportant" : "[1] Set as Important"}
        </ContextMenu.Item>
        <ContextMenu.Item onSelect={() => onRemove(data.id)}>
          [2] Delete Task
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
