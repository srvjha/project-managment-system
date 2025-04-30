import { asyncHandler } from "../utils/asynHandler";


const getTasks = asyncHandler(async (req, res) => {
  
});

// get task by id
// const getTaskById = async (req, res) => {
//   // get task by id
// };

//create task

const createTask =asyncHandler(async (req, res) => {
  // create task
  const {title,description,project,assignedTo,status,attachments} = req.body

});

// update task
// const updateTask = async (req, res) => {
//   // update task
// };

// delete task
// const deleteTask = async (req, res) => {
//   // delete task
// };

// create subtask
// const createSubTask = async (req, res) => {
//   // create subtask
// };

// update subtask
// const updateSubTask = async (req, res) => {
//   // update subtask
// };

// delete subtask
// const deleteSubTask = async (req, res) => {
//   // delete subtask
// };

export {
  // createSubTask,
  // createTask,
  // deleteSubTask,
  // deleteTask,
  // getTaskById,
  // getTasks,
  // updateSubTask,
  // updateTask,
};
