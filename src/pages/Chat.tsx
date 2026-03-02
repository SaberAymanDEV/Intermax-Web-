/// <reference types="vite/client" />
import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { Send, User, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

export default function Chat() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const chatUserId = searchParams.get('user');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        const url = user.role === 'admin' && chatUserId 
          ? `/api/chat/messages?userId=${chatUserId}`
          : '/api/chat/messages';
        const data = await api(url);
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };

    fetchMessages();

    const newSocket = io(import.meta.env.VITE_API_URL || '');

    newSocket.on('connect', () => {
      newSocket.emit('join', { userId: user.id, role: user.role });
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === message.id)) return prev;
        // If admin, only show messages for the current chat user
        if (user.role === 'admin' && chatUserId) {
          if (message.sender_id.toString() !== chatUserId && message.receiver_id.toString() !== chatUserId) {
            return prev;
          }
        }
        return [...prev, message];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, chatUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    const receiverId = user.role === 'admin' ? (chatUserId ? parseInt(chatUserId) : 1) : 1;

    const messageData = {
      senderId: user.id,
      receiverId: receiverId,
      content: newMessage,
      role: user.role
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  if (!user) return null;

  if (user.role === 'admin' && !chatUserId) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center" dir="rtl">
        <div className="text-center text-slate-500">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-xl">يرجى اختيار مستخدم من لوحة التحكم لبدء المحادثة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-[80vh] flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-grow flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {user.role === 'admin' ? 'محادثة مع العميل' : 'الدعم الفني'}
                </h2>
                <p className="text-sm text-slate-500">
                  {user.role === 'admin' ? 'الرد على استفسارات العميل' : 'نحن هنا لمساعدتك'}
                </p>
              </div>
            </div>
            {user.role === 'admin' && (
              <button 
                onClick={() => window.history.back()}
                className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                العودة للوحة التحكم
              </button>
            )}
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <span className={`text-xs mt-2 block ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-grow px-6 py-4 rounded-full border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-6 h-6 rtl:-scale-x-100" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
