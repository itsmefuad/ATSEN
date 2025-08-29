import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Paperclip, 
  Search, 
  MoreVertical, 
  Reply, 
  Edit, 
  Trash2, 
  Download,
  Image,
  File,
  Smile
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const RoomChat = ({ roomId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  const commonEmojis = ['👍', '❤️', '😂', '😊', '😢', '😮', '😡', '👏', '🔥', '💯'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (roomId) {
      fetchMessages();
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/room/${roomId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    setSending(true);
    try {
      let response;
      
      if (selectedFile) {
        // Send file message
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (replyingTo) {
          formData.append('replyTo', replyingTo._id);
        }
        
        response = await api.post(`/chat/room/${roomId}/file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Send text message
        response = await api.post(`/chat/room/${roomId}/message`, {
          content: newMessage.trim(),
          replyTo: replyingTo?._id
        });
      }

      setMessages(prev => [...prev, response.data]);
      setNewMessage("");
      setSelectedFile(null);
      setReplyingTo(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      const response = await api.put(`/chat/message/${messageId}`, {
        content: newContent
      });
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? response.data : msg
      ));
      setEditingMessage(null);
      toast.success("Message updated");
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Failed to edit message");
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await api.delete(`/chat/message/${messageId}`);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const response = await api.post(`/chat/message/${messageId}/reaction`, {
        emoji
      });
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? response.data : msg
      ));
      setShowEmojiPicker(null);
    } catch (error) {
      console.error("Error adding reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  const searchMessages = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await api.get(`/chat/room/${roomId}/search`, {
        params: { query: searchQuery.trim() }
      });
      setSearchResults(response.data.messages);
    } catch (error) {
      console.error("Error searching messages:", error);
      toast.error("Failed to search messages");
    } finally {
      setIsSearching(false);
    }
  };

  const downloadFile = async (messageId, fileName) => {
    try {
      const response = await api.get(`/chat/download/${messageId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const MessageItem = ({ message }) => {
    const isOwnMessage = user && message.sender?._id === user._id;
    
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {!isOwnMessage && (
            <div className="text-sm text-base-content/60 mb-1">
              {message.sender?.name || 'Unknown User'}
            </div>
          )}
          
          {message.replyTo && (
            <div className="bg-base-200 border-l-4 border-primary p-2 mb-2 rounded">
              <div className="text-xs text-base-content/60">
                Replying to {message.replyTo.sender?.name}
              </div>
              <div className="text-sm truncate">
                {message.replyTo.messageType === 'text' 
                  ? message.replyTo.content 
                  : `${message.replyTo.messageType}: ${message.replyTo.fileName}`
                }
              </div>
            </div>
          )}
          
          <div className={`
            ${isOwnMessage 
              ? 'bg-primary text-primary-content' 
              : 'bg-base-300 text-base-content'
            } 
            p-3 rounded-lg relative group
          `}>
            {editingMessage === message._id ? (
              <div className="space-y-2">
                <textarea
                  className="textarea textarea-sm w-full bg-base-100 text-base-content"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      editMessage(message._id, newMessage);
                    }
                    if (e.key === 'Escape') {
                      setEditingMessage(null);
                      setNewMessage("");
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => editMessage(message._id, newMessage)}
                    className="btn btn-xs btn-success"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setNewMessage("");
                    }}
                    className="btn btn-xs btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Message Content */}
                {message.messageType === 'text' && (
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isEdited && (
                      <span className="text-xs opacity-60 ml-2">(edited)</span>
                    )}
                  </div>
                )}
                
                {message.messageType === 'image' && (
                  <div className="space-y-2">
                    <img
                      src={`/api/chat/download/${message._id}`}
                      alt={message.fileName}
                      className="max-w-full h-auto rounded cursor-pointer"
                      onClick={() => downloadFile(message._id, message.fileName)}
                    />
                    <div className="text-xs opacity-80">{message.fileName}</div>
                  </div>
                )}
                
                {message.messageType === 'file' && (
                  <div className="flex items-center gap-2 p-2 bg-base-100/10 rounded">
                    <File className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{message.fileName}</div>
                      <div className="text-xs opacity-70">
                        {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(message._id, message.fileName)}
                      className="btn btn-xs btn-ghost"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {Object.entries(
                      message.reactions.reduce((acc, reaction) => {
                        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className="text-xs bg-base-100/20 px-2 py-1 rounded cursor-pointer hover:bg-base-100/30"
                        onClick={() => addReaction(message._id, emoji)}
                      >
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Message Actions */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-xs btn-ghost">
                      <MoreVertical className="h-3 w-3" />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <button onClick={() => setReplyingTo(message)}>
                          <Reply className="h-4 w-4" />
                          Reply
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setShowEmojiPicker(message._id)}>
                          <Smile className="h-4 w-4" />
                          React
                        </button>
                      </li>
                      {isOwnMessage && message.messageType === 'text' && (
                        <li>
                          <button onClick={() => {
                            setEditingMessage(message._id);
                            setNewMessage(message.content);
                          }}>
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        </li>
                      )}
                      {isOwnMessage && (
                        <li>
                          <button onClick={() => deleteMessage(message._id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </>
            )}
            
            {/* Emoji Picker */}
            {showEmojiPicker === message._id && (
              <div className="absolute bottom-full mb-2 bg-base-100 border rounded-lg p-2 shadow-lg z-10">
                <div className="flex gap-1">
                  {commonEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(message._id, emoji)}
                      className="hover:bg-base-200 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className={`text-xs text-base-content/50 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border border-base-300 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Room Chat</h3>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="btn btn-ghost btn-sm"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        
        {showSearch && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Search messages..."
              className="input input-sm input-bordered flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchMessages();
                }
              }}
            />
            <button
              onClick={searchMessages}
              className="btn btn-sm btn-primary"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="loading loading-spinner loading-xs"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showSearch && searchResults.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-base-content/60">
              Found {searchResults.length} results for "{searchQuery}"
            </div>
            {searchResults.map(message => (
              <MessageItem 
                key={message._id} 
                message={message}
              />
            ))}
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showDateSeparator = index === 0 || 
                formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
              
              return (
                <div key={message._id}>
                  {showDateSeparator && (
                    <div className="text-center text-sm text-base-content/60 my-4">
                      <div className="divider">{formatDate(message.createdAt)}</div>
                    </div>
                  )}
                  <MessageItem 
                    message={message}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <div className="p-2 bg-base-200 border-t border-base-300 flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-base-content/60">
              Replying to {replyingTo.sender?.name}
            </div>
            <div className="text-sm truncate">
              {replyingTo.messageType === 'text' 
                ? replyingTo.content 
                : `${replyingTo.messageType}: ${replyingTo.fileName}`
              }
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="btn btn-ghost btn-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="p-2 bg-base-200 border-t border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedFile.type.startsWith('image/') ? (
              <Image className="h-4 w-4" />
            ) : (
              <File className="h-4 w-4" />
            )}
            <span className="text-sm">{selectedFile.name}</span>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="btn btn-ghost btn-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-base-300">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost btn-sm"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            ref={textAreaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="textarea textarea-bordered flex-1 resize-none"
            rows="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !selectedFile)}
            className="btn btn-primary"
          >
            {sending ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomChat;
