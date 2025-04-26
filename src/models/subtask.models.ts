import mongoose, { Schema } from "mongoose";

interface subTaskSchemaInterface{
    title:string,
    task:Schema.Types.ObjectId,
    isCompleted:boolean,
    createdBy:Schema.Types.ObjectId
}
const subtaskSchema = new Schema<subTaskSchemaInterface>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

export const SubTask = mongoose.model("SubTask", subtaskSchema);
