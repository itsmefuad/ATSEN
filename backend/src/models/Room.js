import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } //createdAt, updatedAt
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
