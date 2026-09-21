import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Customer, Employee, Supplier, AppUser } from '../types';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Search, 
  Sparkles, 
  CheckCheck, 
  Check, 
  User, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Store, 
  Bot, 
  X, 
  Paperclip, 
  Smile, 
  Bell,
  Download,
  Trash2,
  Radio
} from 'lucide-react';
import { subscribeToRealtimeChat, sendRealtimeChatMessage } from '../firebase';
import { exportToCSV } from '../utils/exportImport';
import ConfirmModal from './ConfirmModal';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'cashier' | 'customer' | 'supplier' | 'staff';
  receiverId: string;
  receiverName: string;
  receiverRole: 'admin' | 'cashier' | 'customer' | 'supplier' | 'staff';
  text: string;
  timestamp: string;
  isRead: boolean;
  isAutoReply?: boolean;
}

interface SupermarketLiveChatProps {
  currentUser: AppUser | null;
  customers: Customer[];
  employees: Employee[];
  suppliers: Supplier[];
  supermarketName?: string;
  onSaveMessages?: (msgs: ChatMessage[]) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    senderId: 'cust_1',
    senderName: 'Axmed Cali Nuur',
    senderRole: 'customer',
    receiverId: 'admin_1',
    receiverName: 'Maamulaha Guud',
    receiverRole: 'admin',
    text: 'Asc Maamule, fadlan ma ii sheegi kartaa haddii Bariiskii Basmati 25kg uu bakhaarka yaallo?',
    timestamp: '10:15 AM',
    isRead: true
  },
  {
    id: 'msg_2',
    senderId: 'admin_1',
    senderName: 'Maamulaha Guud',
    senderRole: 'admin',
    receiverId: 'cust_1',
    receiverName: 'Axmed Cali Nuur',
    receiverRole: 'customer',
    text: 'Wcs mudane Axmed. Haa, waan haynaa 45 kiish, kiishkuna waa $24.50. Waad ku mahadsan tahay nala soo xiriirkaaga!',
    timestamp: '10:17 AM',
    isRead: true
  },
  {
    id: 'msg_3',
    senderId: 'emp_1',
    senderName: 'Faadumo Axmed',
    senderRole: 'cashier',
    receiverId: 'admin_1',
    receiverName: 'Maamulaha Guud',
    receiverRole: 'admin',
    text: 'Maamule, Counter #2 xaashidii daabacada rasiidhada (thermal rolls) ayaa gabaabsi noqotay.',
    timestamp: '11:00 AM',
    isRead: true
  },
  {
    id: 'msg_4',
    senderId: 'admin_1',
    senderName: 'Maamulaha Guud',
    senderRole: 'admin',
    receiverId: 'emp_1',
    receiverName: 'Faadumo Axmed',
    receiverRole: 'cashier',
    text: 'Hadda ayaan qasnada keensanayaa 2 baakidh oo rolls ah. Mahadsanid!',
    timestamp: '11:02 AM',
    isRead: true
  }
];

const QUICK_TEMPLATES = [
  "Waad salaaman tahay! Sideen kuu caawin karnaa maanta?",
  "Haa, alaabtaas hadda bakhaarka way noo taal.",
  "Rasiidhkaaga iyo dayntaada xisaabtu waa nadiif.",
  "Dalabkaagii waa diyaar, fadlan ka qaado counter-ka.",
  "Xafiiska maamulka ayaa kugu soo jawaabaya daqiiqado gudahood."
];

export default function SupermarketLiveChat({
  currentUser,
  customers,
  employees,
  suppliers,
  supermarketName = 'Xaaji Salaad Supermarket'
}: SupermarketLiveChatProps) {
  const currentRole = currentUser?.role || 'admin';
  const isAdmin = currentRole === 'admin';

  // State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('supermarket_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MESSAGES;
      }
    }
    return INITIAL_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'cashiers' | 'customers' | 'suppliers'>('all');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Subscribe to Firestore Realtime Chat (Online Sync within milliseconds!)
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeChat(
      (firestoreMsgs) => {
        if (firestoreMsgs && firestoreMsgs.length > 0) {
          setIsLiveConnected(true);
          setMessages((prevLocal) => {
            const combinedMap = new Map<string, ChatMessage>();
            prevLocal.forEach((m) => combinedMap.set(m.id, m));
            firestoreMsgs.forEach((fm: any) => {
              combinedMap.set(fm.id, {
                id: fm.id,
                senderId: fm.senderId || 'user',
                senderName: fm.senderName || 'Anonymous',
                senderRole: fm.senderRole || 'staff',
                receiverId: fm.receiverId || 'admin_1',
                receiverName: fm.receiverName || 'Maamulaha Guud',
                receiverRole: fm.receiverRole || 'admin',
                text: fm.text || '',
                timestamp: fm.timestamp || new Date(fm.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: fm.isRead ?? true,
                isAutoReply: fm.isAutoReply
              });
            });
            return Array.from(combinedMap.values());
          });
        }
      },
      () => {
        setIsLiveConnected(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Define contact list
  // If user is admin: can see all cashiers, customers, suppliers
  // If user is customer/cashier/staff: ONLY CAN CHAT WITH THE ADMIN!
  const contacts = useMemo(() => {
    if (!isAdmin) {
      return [
        {
          id: 'admin_1',
          name: 'Maamulaha Guud (Manager)',
          role: 'admin' as const,
          phone: '+252 61 5000000',
          subtitle: 'Xafiiska Sare ee Supermarket-ka • Online'
        }
      ];
    }

    // Admin sees all contacts
    const list: Array<{ id: string; name: string; role: 'cashier' | 'customer' | 'supplier' | 'staff'; phone: string; subtitle: string }> = [];

    employees.forEach(e => {
      list.push({
        id: e.id,
        name: e.name,
        role: e.role === 'cashier' ? 'cashier' : 'staff',
        phone: e.phone,
        subtitle: `${e.roleTitle} • ${e.shift}`
      });
    });

    customers.forEach(c => {
      list.push({
        id: c.id,
        name: c.name,
        role: 'customer',
        phone: c.phone,
        subtitle: `Macmiil • Deynta: $${c.totalDebt.toFixed(2)}`
      });
    });

    suppliers.forEach(s => {
      list.push({
        id: s.id,
        name: s.name,
        role: 'supplier',
        phone: s.phone,
        subtitle: `Shirkad Keenis • ${s.company}`
      });
    });

    return list;
  }, [isAdmin, employees, customers, suppliers]);

  // Selected contact
  const [selectedContactId, setSelectedContactId] = useState<string>(() => {
    return isAdmin ? (contacts[0]?.id || 'emp_1') : 'admin_1';
  });

  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.subtitle.toLowerCase().includes(q);

      if (!isAdmin) return true;
      if (activeCategoryTab === 'cashiers') return matchesSearch && (c.role === 'cashier' || c.role === 'staff');
      if (activeCategoryTab === 'customers') return matchesSearch && c.role === 'customer';
      if (activeCategoryTab === 'suppliers') return matchesSearch && c.role === 'supplier';
      return matchesSearch;
    });
  }, [contacts, searchQuery, activeCategoryTab, isAdmin]);

  // Active chat messages
  const currentChatMessages = useMemo(() => {
    if (!selectedContact) return [];
    const myId = isAdmin ? 'admin_1' : (currentUser?.assignedCustomerId || currentUser?.id || 'cust_1');

    return messages.filter(m => {
      const condition1 = m.senderId === myId && m.receiverId === selectedContact.id;
      const condition2 = m.senderId === selectedContact.id && m.receiverId === myId;
      // Allow demo visibility
      return condition1 || condition2 || (isAdmin && (m.senderId === selectedContact.id || m.receiverId === selectedContact.id));
    });
  }, [messages, selectedContact, isAdmin, currentUser]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('supermarket_chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !selectedContact) return;

    const myId = isAdmin ? 'admin_1' : (currentUser?.assignedCustomerId || currentUser?.id || 'cust_1');
    const myName = isAdmin ? 'Maamulaha Guud' : (currentUser?.fullName || currentUser?.name || currentUser?.username || 'Macmiilka');
    const myRole = isAdmin ? 'admin' : 'customer';

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: myId,
      senderName: myName,
      senderRole: myRole,
      receiverId: selectedContact.id,
      receiverName: selectedContact.name,
      receiverRole: selectedContact.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputMessage('');

    // Send to Firestore in real-time
    try {
      await sendRealtimeChatMessage({
        senderId: myId,
        senderName: myName,
        senderRole: myRole,
        receiverId: selectedContact.id,
        receiverName: selectedContact.name,
        receiverRole: selectedContact.role,
        text,
        timestamp: newMsg.timestamp,
        isRead: false
      });
    } catch (e) {
      console.warn('Realtime chat send fallback to local:', e);
    }

    // AUTOMATIC RESPONSE FEATURE:
    if (!isAdmin && autoReplyEnabled) {
      setTimeout(async () => {
        const autoReply: ChatMessage = {
          id: `msg_auto_${Date.now()}`,
          senderId: 'admin_1',
          senderName: 'Maamulka Supermarket-ka [Auto-Reply]',
          senderRole: 'admin',
          receiverId: myId,
          receiverName: myName,
          receiverRole: myRole,
          text: `Asc ${myName}! Fariintaada si toos ah ayaan u helnay. Xafiiska maamulka ${supermarketName} ayaa kugu soo jawaabaya isla markiiba. Mahadsanid!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
          isAutoReply: true
        };
        setMessages(prev => [...prev, autoReply]);
        try {
          await sendRealtimeChatMessage({ ...autoReply });
        } catch (_) {}
      }, 900);
    }
  };

  // Export Chat to CSV / Excel
  const handleExportChat = () => {
    const headers = ['ID', 'Wakhtiga', 'Qofka Diray', 'Doorka Diraha', 'Qofka Loo Diray', 'Doorka Loo Diray', 'Qoraalka Fariinta'];
    const rows = messages.map(m => [
      m.id,
      m.timestamp,
      m.senderName,
      m.senderRole,
      m.receiverName,
      m.receiverRole,
      m.text
    ]);
    exportToCSV(`Chat_History_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleClearAllChat = () => {
    setMessages([]);
    localStorage.removeItem('supermarket_chat_messages');
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Xarunta Wada-hadalka Tooska ah (Live Chat Hub)
              </h1>
              {/* Online Firebase Indicator */}
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>100% Online Firebase</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin 
                ? 'Fariimaha waxay ku dhex wareegayaan Firebase si toos ah ilbiriqsiyo gudahood.'
                : 'Kala hadal maamulka wixii dalab ah, su\'aalo, ama adeegyo gaar ah.'}
            </p>
          </div>
        </div>

        {/* Actions: Export, Clear, and Auto Reply */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportChat}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Kala soo bax Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel Export</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Tirtir Dhammaan Fariimaha"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Tirtir Chat-ka</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>Auto-Reply: Shaqeynaya</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden h-[620px] grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Contact List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raadi qof, taleefan..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
              />
            </div>

            {/* Filter Tabs (Admin only) */}
            {isAdmin && (
              <div className="flex items-center gap-1 mt-2.5 overflow-x-auto text-[10px] font-bold">
                <button
                  onClick={() => setActiveCategoryTab('all')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    activeCategoryTab === 'all' ? 'bg-[#042954] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Dhammaan
                </button>
                <button
                  onClick={() => setActiveCategoryTab('cashiers')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    activeCategoryTab === 'cashiers' ? 'bg-[#042954] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Qasnajiyada
                </button>
                <button
                  onClick={() => setActiveCategoryTab('customers')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    activeCategoryTab === 'customers' ? 'bg-[#042954] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Macaamiisha
                </button>
                <button
                  onClick={() => setActiveCategoryTab('suppliers')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    activeCategoryTab === 'suppliers' ? 'bg-[#042954] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Shirkadaha
                </button>
              </div>
            )}
          </div>

          {/* Contact Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredContacts.map(c => {
              const isSelected = c.id === selectedContactId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContactId(c.id)}
                  className={`w-full text-left p-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected ? 'bg-white shadow-xs border border-slate-200' : 'hover:bg-white/80'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    c.role === 'admin' ? 'bg-[#042954] text-[#ffae01]' :
                    c.role === 'cashier' ? 'bg-emerald-100 text-emerald-800' :
                    c.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {c.role === 'admin' ? <Store className="w-5 h-5" /> :
                     c.role === 'cashier' ? <ShoppingBag className="w-5 h-5" /> :
                     c.role === 'supplier' ? <Truck className="w-5 h-5" /> :
                     <User className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                      <span className="text-[9px] text-emerald-600 font-bold">Live</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{c.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Conversation Area */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {/* Chat Header */}
          {selectedContact ? (
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#042954] text-[#ffae01] flex items-center justify-center font-bold text-xs">
                  {selectedContact.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 font-display flex items-center gap-1.5">
                    <span>{selectedContact.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  </h3>
                  <p className="text-[10px] text-slate-500">{selectedContact.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedContact.phone}`}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedContact.phone}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-700">Dooro qof aad la hadasho</h3>
            </div>
          )}

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fbfbfb]">
            {currentChatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MessageCircle className="w-10 h-10 mb-2 opacity-30 text-[#042954]" />
                <p className="text-xs font-bold">Weli fariin iskuma dirin.</p>
                <p className="text-[11px] mt-1">Ku dhufo template hoose ama qor fariintaada si aad u bilowdo.</p>
              </div>
            ) : (
              currentChatMessages.map((msg) => {
                const isMe = isAdmin ? msg.senderRole === 'admin' : msg.senderId !== 'admin_1';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600">{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                      {msg.isAutoReply && (
                        <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">
                          Auto-reply
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs shadow-2xs leading-relaxed ${
                        isMe
                          ? 'bg-[#042954] text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                      {isMe && (
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Fariimo Degdeg ah:</span>
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(tmpl)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-[#042954] hover:text-white rounded-lg text-slate-700 text-[10px] font-medium transition-colors shrink-0 cursor-pointer"
              >
                {tmpl.substring(0, 35)}...
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Qor fariintaada halkan..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 bg-[#042954] hover:bg-[#031d3d] disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Dir</span>
              <Send className="w-3.5 h-3.5 text-[#ffae01]" />
            </button>
          </form>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Ma hubtaa inaad tirtirto dhammaan fariimaha?"
        message="Dhammaan wada-hadallada iyo fariimaha qoraalka ah waa la tirtirayaa. Tallaabadan dib looma soo celin karo."
        confirmText="Haa, Tirtir Chat-ka"
        cancelText="Maya, Ka noqo"
        onConfirm={handleClearAllChat}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
