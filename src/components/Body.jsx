import circle from "../assets/circle.svg";
import circle_click from "../assets/circle-click.svg";
import task from "../assets/Add_task.svg";
import chevronDown from "../assets/Chevron down.svg";
import chevronDown_Dark from "../assets/Chevron down_black.svg";
import { formatDistanceToNow } from "date-fns";
import DatePicker from "react-datepicker";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

export default function Body() {
  const [taskData, setTaskData] = useState(() => {
    const storedTasks = localStorage.getItem("Tasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  const [isAllTaskClick, setAllTaskClick] = useState(false);
  const [isSortByDeadline, setSortedByDeadline] = useState(false);
  const [isSortedByImportance, setSortedByImportance] = useState(false);
  const newTask = {
    title: "new task",
    desc: "description",
    deadline: null,
    complete: false,
    isImportant: false,
  };

  const handleAddNewTask = (e) => {
    e.preventDefault();
    setTaskData([...taskData, { id: taskData.length + 1, ...newTask }]);
    console.log(taskData);
  };

  const handleTaskUpdate = (taskId, updateField) => {
    setTaskData((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updateField } : task
      )
    );
  };

  const updateTaskDeadline = (taskId, newDate) => {
    setTaskData((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, deadline: newDate } : task
      )
    );
  };

  const removeTask = (taskId) => {
    setTaskData([...taskData.filter((item) => item.id != taskId)]);
  };
  const sortTasks = () => {
    if (isSortByDeadline) {
      setTaskData((prevTasks) => {
        return [...prevTasks].sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
          const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
          return dateA - dateB;
        });
      });
      console.log("deadline");
    } else if (isSortedByImportance) {
      setTaskData((prevTasks) => {
        return [...prevTasks].sort((a, b) => {
          return b.isImportant - a.isImportant;
        });
      });
      console.log("important");
    } else {
      setTaskData((prevTasks) => {
        return [...prevTasks].sort((a, b) => {
          return a.id - b.id;
        });
      });
      console.log("normal");
    }
  };

  useEffect(() => {
    sortTasks(); // Re-sort whenever the sorting state changes
  }, [isSortByDeadline, isSortedByImportance]);

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
                setSortedByDeadline((prev) => !prev);
                setSortedByImportance(false);
                setAllTaskClick((prev) => !prev);
              }}
              style={
                isSortByDeadline
                  ? {
                      color: "black",
                      backgroundColor: "wheat",
                      borderRadius: "0.6rem",
                    }
                  : { color: "black" }
              }
            >
              Sort By Deadline
            </li>
            <li
              onClick={() => {
                setSortedByImportance((prev) => !prev);
                setSortedByDeadline(false);
                setAllTaskClick((prev) => !prev);
              }}
              style={
                isSortedByImportance
                  ? {
                      color: "black",
                      backgroundColor: "wheat",
                      borderRadius: "0.6rem",
                    }
                  : { color: "black" }
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

function Task({ data, onEdit, updateDeadline, onRemove }) {
  const [datePickerState, setDatePickerState] = useState(false);
  const [isRightClicked, setRightClick] = useState(false);

  function handleDateChanging() {
    if (!data.complete) {
      setDatePickerState((prev) => !prev);
    }
  }

  const handleInput = (e) => {
    onEdit(data.id, { [e.target.name]: e.target.value }); // Update state
  };

  const handleCircleClick = (e) => {
    e.preventDefault();
    onEdit(data.id, { complete: !data.complete }); // Pass updated value to parent state
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (isRightClicked) {
      setRightClick(false);
    } else {
      setRightClick(true);
    }
  };

  const handleImportance = (e) => {
    e.preventDefault();
    onEdit(data.id, { isImportant: !data.isImportant }); // Pass updated value to parent state
  };

  return (
    <div
      className={data.complete ? "task-completed" : "task"}
      id={data.isImportant ? "important" : ""}
      onContextMenu={handleRightClick}
      onClick={() => setRightClick(false)}
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
        <h3 onClick={handleDateChanging}>
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
      {isRightClicked && (
        <ul>
          <li onClick={handleImportance}>
            {data.isImportant ? "Set as Unimportant" : "Set as Important"}
          </li>
          <li onClick={() => onRemove(data.id)}>Delete Task</li>
        </ul>
      )}
    </div>
  );
}
