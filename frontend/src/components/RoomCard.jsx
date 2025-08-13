import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const RoomCard = ({ room, setRooms }) => {
  const handleDelete = async (e, id) => {
    e.preventDefault(); // get rid of the navigation behaviour

    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await api.delete(`/rooms/${id}`);
      setRooms((prev) => prev.filter((room) => room._id !== id)); // get rid of the deleted one
      toast.success("Room deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete room");
    }
  };
  return (
    <Link
      to={`/teacher/room/${room._id}`}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200
        border-t-4 border-solid border-[#4f46e5]"
    >
      <div className="card-body">
        <h3 className="card-title text-base-content">{room.course_name}</h3>
        <p className="text-base-content/70 line-clamp-3">{room.description}</p>
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(room.createdAt))}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4" />
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => handleDelete(e, room._id)}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
