import mongoose from "mongoose";
const { Schema } = mongoose;

const chatMessageSchema = new Schema(
  {
    room: { 
      type: Schema.Types.ObjectId, 
      ref: "Room", 
      required: true 
    },
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: "Student", 
      required: true 
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'image'],
      default: 'text'
    },
    content: { 
      type: String, 
      required: function() {
        return this.messageType === 'text';
      }
    },
    fileName: { 
      type: String,
      required: function() {
        return this.messageType === 'file' || this.messageType === 'image';
      }
    },
    filePath: { 
      type: String,
      required: function() {
        return this.messageType === 'file' || this.messageType === 'image';
      }
    },
    fileSize: { 
      type: Number,
      default: 0
    },
    isEdited: { 
      type: Boolean, 
      default: false 
    },
    editedAt: { 
      type: Date,
      default: null 
    },
    replyTo: { 
      type: Schema.Types.ObjectId, 
      ref: "ChatMessage",
      default: null 
    },
    reactions: [{
      student: { 
        type: Schema.Types.ObjectId, 
        ref: "Student" 
      },
      emoji: { 
        type: String, 
        required: true 
      }
    }],
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    deletedAt: { 
      type: Date,
      default: null 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient querying
chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });

// Virtual for message age
chatMessageSchema.virtual('messageAge').get(function() {
  return Date.now() - this.createdAt.getTime();
});

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
export default ChatMessage;
