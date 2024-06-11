import { Fragment, useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { Spacer } from "@nextui-org/spacer";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import io from "socket.io-client";
import { IconButton, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { BASE_URL, SOCKET_URL } from "@/config/api.ts";
const socket = io(SOCKET_URL);

interface ITask {
  id: number;
  completed: boolean;
  title: string;
}

export const FormTask = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedTask, setEditedTask] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [openSnack, setOpenSnack] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);
  // subscribe to notifications
  useEffect(() => {
    socket.on("notification", (data) => {
      setNotificationMessage(data.message);
      setOpenSnack(true);
    });

    return () => {
      socket.off("notification");
    };
  }, []);
  const addTask = async () => {
    try {
      if (!task) {
        setError("Por favor, ingresa una tarea.");

        return;
      }

      const response = await fetch(`${BASE_URL}/tasks/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: task }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      await fetchTasks();
      setTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();

      setTasks(data.data.rows);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const toggleTaskCompletion = async (index: number) => {
    const updatedTasks = [...tasks];

    updatedTasks[index].completed = !updatedTasks[index].completed;
    try {
      const response = await fetch(
        `${BASE_URL}/tasks/${updatedTasks[index].id}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTasks[index]),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to toggle task completion");
      }
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/tasks/${id}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const startEditing = (index: number) => {
    setEditIndex(index);
    setEditedTask(tasks[index].title);
  };

  const cancelEditing = () => {
    setEditIndex(null);
    setEditedTask("");
  };

  const saveTask = async (index: number) => {
    try {
      const response = await fetch(
        `${BASE_URL}/tasks/${tasks[index].id}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: editedTask }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      await fetchTasks();
      setEditIndex(null);
      setEditedTask("");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };
  const action = (
    <Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  return (
    <>
      <Snackbar
        action={action}
        autoHideDuration={6000}
        message={notificationMessage}
        open={openSnack}
        onClose={handleClose}
      />
      <h1>To-Do List</h1>
      <div className={"flex items-center mb-2"}>
        <Input value={task} onChange={(e) => setTask(e.target.value)} />
        <Spacer y={0.5} />
        <Button onClick={addTask}>Add Task</Button>
      </div>
      <Spacer y={1} />
      {tasks.map((task, index) => (
        <div key={index} className={"flex items-center mb-2 gap-1"}>
          <Checkbox
            checked={task.completed}
            className={"flex-none"}
            defaultSelected={task.completed}
            onChange={() => toggleTaskCompletion(index)}
          />
          <Spacer x={0.5} />
          {editIndex === index ? (
            <>
              <Input
                value={editedTask}
                onChange={(e) => setEditedTask(e.target.value)}
              />
              <Spacer x={0.5} />
              <Button onClick={() => saveTask(index)}>Save</Button>
              <Button onClick={cancelEditing}>Cancel</Button>
            </>
          ) : (
            <>
              <h1
                className={"grow w-full"}
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.title}
              </h1>
              <Button
                className="mx-auto flex-none"
                onClick={() => startEditing(index)}
              >
                Edit
              </Button>
              <Button onClick={() => deleteTask(task.id)}>Delete</Button>
            </>
          )}
        </div>
      ))}
      <Modal isOpen={!!error} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Error</ModalHeader>
              <ModalBody>{error}</ModalBody>
              <ModalFooter>
                <Button
                  onClick={() => {
                    onClose();
                    setError("");
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
