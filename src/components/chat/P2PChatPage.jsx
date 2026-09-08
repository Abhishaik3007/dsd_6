import React, { useState, useEffect, useRef } from 'react';
import { useHub } from '../../context/HubContext';
import { useP2PChat, generateRoomCode } from './useP2PChat';
import { soundFX } from './chatAudio';
import {
  Radio,
  Send,
  Paperclip,
  Smile,
  Users,
  Copy,
  Check,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  ArrowLeft,
  LogOut,
  AlertCircle,
  Sun,
  Moon,
  Reply,
  X,
  File,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  Clock,
  ShieldCheck,
  ChevronDown,
  Info,
  Maximize2,
  RefreshCw
} from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '🎉', '💡', '👀', '🚀'];
const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'] },
  { name: 'Gestures', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🧠', '🫀', '👀', '👁️', '👅', '👄'] },
  { name: 'Signals & Vibes', emojis: ['🔥', '✨', '⚡', '💫', '💥', '💯', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🎉', '🎊', '🎈', '🚀', '🛸', '🛰️', '💡', '📡', '💻', '🖥️', '⌨️', '🕹️', '🛡️', '🔑', '🔒', '🔓', '⚙️', '🧩', '🎯', '🏆', '⭐', '🌟', '💎'] }
];

export const P2PChatPage = () => {
  const { setActiveTab, themeMode, toggleThemeMode } = useHub();
  const isDark = themeMode === 'dark';

  const getUrlRoom = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const match = path.match(/^\/(?:mesh|chat|p2p-chat)\/([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        return match[1];
      }
      const params = new URLSearchParams(window.location.search);
      return params.get('room') || '';
    }
    return '';
  };

  const initialUrlRoom = getUrlRoom();
  const {
    roomCode,
    setRoomCode,
    userName,
    setUserName,
    peerName,
    peerNames,
    maxPeers,
    setMaxPeers,
    status,
    statusMessage,
    errorMessage,
    setErrorMessage,
    messages,
    isPeerTyping,
    latency,
    packetsCount,
    transportMode,
    isHost,
    connectToRoom,
    disconnect,
    sendMessage,
    sendReaction,
    sendTyping,
  } = useP2PChat(initialUrlRoom);

  const [inputVal, setInputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileAttachment, setFileAttachment] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState(initialUrlRoom);
  const [joinError, setJoinError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeReactionMenuMsgId, setActiveReactionMenuMsgId] = useState(null);
  const [showComposerEmoji, setShowComposerEmoji] = useState(false);
  const [showConnectingBanner, setShowConnectingBanner] = useState(false);

  // Debounce standby banner: never show if messages exist (e.g. refresh), and wait 500ms if empty room
  useEffect(() => {
    let timer;
    if (status === 'connecting' && messages.length === 0) {
      timer = setTimeout(() => {
        setShowConnectingBanner(true);
      }, 500);
    } else {
      setShowConnectingBanner(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, messages.length]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingDebounceRef = useRef(null);

  // Close reaction and composer popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.reaction-popover-anchor') && !e.target.closest('.composer-emoji-anchor')) {
        setActiveReactionMenuMsgId(null);
        setShowComposerEmoji(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB limit for instant in-memory transfer.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        data: event.target.result,
      });
      soundFX.playChime('react');
    };
    reader.readAsDataURL(file);
  };

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // Dynamic Page Title
  useEffect(() => {
    const prevTitle = document.title;
    if (roomCode) {
      document.title = `Mesh Room (${roomCode}) — signal school`;
    } else {
      document.title = `Mesh Room — signal school`;
    }
    return () => {
      document.title = prevTitle;
    };
  }, [roomCode]);

  // Handle direct URL landing on /mesh/:roomCode:
  // If the user pastes /mesh/ROOM directly into a fresh tab, seed history with /mesh
  // so the browser Back button takes them to /mesh instead of leaving the site.
  useEffect(() => {
    if (typeof window !== 'undefined' && initialUrlRoom) {
      try {
        if (!window.history.state || window.history.state.room !== initialUrlRoom) {
          window.history.replaceState({ tab: 'p2p-chat' }, '', '/mesh');
          window.history.pushState({ tab: 'p2p-chat', room: initialUrlRoom }, '', `/mesh/${initialUrlRoom}`);
        }
      } catch { }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync room in URL pathname with pushState when navigating from /mesh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (roomCode && status !== 'idle') {
          const targetPath = `/mesh/${roomCode}`;
          if (window.location.pathname !== targetPath) {
            // If currently at /mesh or /chat lobby, push state so browser Back returns to /mesh
            const isLobby = window.location.pathname === '/mesh' || window.location.pathname === '/chat' || window.location.pathname === '/';
            if (isLobby) {
              window.history.pushState({ tab: 'p2p-chat', room: roomCode }, '', targetPath);
            } else {
              window.history.replaceState({ tab: 'p2p-chat', room: roomCode }, '', targetPath);
            }
          }
        }
      } catch { }
    }
  }, [roomCode, status]);

  // Listen to browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handleBrowserNav = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      const match = path.match(/^\/(?:mesh|chat|p2p-chat)\/([a-zA-Z0-9_-]+)/i);
      const urlRoom = match && match[1] ? match[1].trim().toUpperCase() : '';

      if (!urlRoom) {
        // User pressed browser Back to /mesh lobby:
        // Gracefully disconnect from active room and display lobby screen
        if (status !== 'idle') {
          disconnect();
          setJoinCodeInput('');
          setJoinError('');
          setReplyingTo(null);
        }
      } else if (urlRoom !== roomCode) {
        // User navigated forward/back to a different room
        connectToRoom(urlRoom, false);
      }
    };

    window.addEventListener('popstate', handleBrowserNav);
    return () => window.removeEventListener('popstate', handleBrowserNav);
  }, [disconnect, connectToRoom, roomCode, status]);

  // Auto-join is handled internally by useP2PChat hook

  const handleJoinSubmit = (e) => {
    if (e) e.preventDefault();
    setJoinError('');
    if (setErrorMessage) setErrorMessage('');
    const clean = joinCodeInput.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!clean || clean.length < 3) {
      setJoinError('Invalid Room ID: Code must be at least 3 characters.');
      soundFX.playChime('leave');
      return;
    }

    try {
      sessionStorage.setItem(`dsd_p2p_is_host_${clean}`, 'false');
    } catch { }
    connectToRoom(clean, false);
  };

  const handleLeave = () => {
    disconnect();
    setJoinCodeInput('');
    setJoinError('');
    setReplyingTo(null);
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState({ tab: 'p2p-chat' }, '', '/mesh');
      } catch { }
    }
  };

  const handleCopyLink = () => {
    const origin = window.location.origin;
    const targetRoom = roomCode || joinCodeInput;
    const url = `${origin}/mesh/${targetRoom}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const nextState = !muted;
    setMuted(nextState);
    soundFX.setMuted(nextState);
  };

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    if (status === 'connected') {
      sendTyping(true);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        sendTyping(false);
      }, 1500);
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() && !fileAttachment) return;

    sendMessage(inputVal, fileAttachment, replyingTo);
    setInputVal('');
    setFileAttachment(null);
    setReplyingTo(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && replyingTo) {
      e.preventDefault();
      setReplyingTo(null);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB limit for instant in-memory transfer.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        data: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    let foundImage = false;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            foundImage = true;
            if (file.size > 3 * 1024 * 1024) {
              alert('Pasted image exceeds 3MB limit for in-memory transfer.');
              return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
              setFileAttachment({
                name: file.name && file.name !== 'image.png' ? file.name : `screenshot_${Date.now().toString(36)}.png`,
                size: (file.size / 1024).toFixed(1) + ' KB',
                type: file.type || 'image/png',
                data: event.target.result,
              });
              soundFX.playChime('react');
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    }

    if (!foundImage && clipboardData.files && clipboardData.files.length > 0) {
      const file = clipboardData.files[0];
      if (file.type && file.type.startsWith('image/')) {
        foundImage = true;
        if (file.size > 3 * 1024 * 1024) {
          alert('Pasted file exceeds 3MB limit for in-memory transfer.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          setFileAttachment({
            name: file.name || `pasted_image_${Date.now().toString(36)}.png`,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            data: event.target.result,
          });
          soundFX.playChime('react');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Global paste handler when inside active room
  useEffect(() => {
    if (status === 'connected') {
      const globalPasteListener = (e) => {
        if (document.activeElement !== messageInputRef.current) {
          handlePaste(e);
        }
      };
      window.addEventListener('paste', globalPasteListener);
      return () => window.removeEventListener('paste', globalPasteListener);
    }
  }, [status]);


  return (
    <div className={`${isDark ? 'bg-[#0b0f19] text-[#e2e8f0]' : 'bg-[#f6f3eb] text-[#203247]'} selection:bg-[#347f7a] selection:text-[#f6f3eb] flex flex-col font-space-grotesk ${status !== 'idle' ? 'h-screen overflow-hidden' : 'min-h-screen'} transition-colors duration-200`}>

      {/* TOP NAVIGATION BAR */}
      <nav className={`sticky top-0 z-40 border-b ${isDark ? 'border-slate-800/80 bg-[#0f172a]/95' : 'border-[#203247]/10 bg-[#f5f3ed]/95'} backdrop-blur-md shrink-0 transition-colors duration-200`}>
        <div className="mx-auto flex h-[66px] max-w-[1440px] 2xl:max-w-[1560px] items-center justify-between px-5 sm:px-8">

          {/* Brand & Hub Link */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('hub');
              }}
              className="flex items-center text-decoration-none group cursor-pointer"
            >
              <span className={`font-space-grotesk text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#203247]'}`}>
                signal<span className="text-[#347f7a] font-normal">school</span>
              </span>
            </a>

            <div className={`hidden md:flex items-center gap-2 pl-3 border-l ${isDark ? 'border-slate-800' : 'border-[#203247]/15'}`}>
              <span className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#347f7a] animate-pulse" />
                mesh room
              </span>
            </div>
          </div>

          {/* Right Action & Status Bar */}
          <div className="flex items-center gap-3">
            {/* Live Connection & Latency Indicator */}
            {status === 'connected' ? (
              <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono-signal ${isDark ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-[#d9e8df] border-[#203247]/10 text-[#203247]'}`}>
                <span className="h-2 w-2 rounded-full bg-[#347f7a] animate-ping" />
                <span className="font-semibold">DIRECT LINK</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isDark ? 'bg-slate-900 text-emerald-400' : 'bg-white/80 text-[#347f7a]'}`}>
                  {latency !== null ? `${latency}ms` : '< 2ms'}
                </span>
              </div>
            ) : status === 'connecting' ? (
              <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono-signal ${isDark ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-[#f5dec5] border-[#203247]/10 text-[#b3673c]'}`}>
                <RefreshCw size={12} className="animate-spin" />
                <span>LINKING...</span>
              </div>
            ) : null}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={muted ? 'Unmute' : 'Mute'}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors cursor-pointer shadow-xs ${isDark ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-white/80 hover:bg-white border-[#203247]/10 text-[#203247]'}`}
            >
              {muted ? <VolumeX size={15} className="text-[#e06c53]" /> : <Volume2 size={15} />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleThemeMode}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors cursor-pointer shadow-xs ${isDark ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-amber-400' : 'bg-white/80 hover:bg-white border-[#203247]/10 text-[#203247]'}`}
            >
              {isDark ? (
                <Sun size={15} className="animate-in spin-in-90 duration-300" />
              ) : (
                <Moon size={15} className="animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Exit / Leave Button */}
            {status !== 'idle' ? (
              <button
                onClick={handleLeave}
                className="rounded-full bg-[#203247] text-[#f6f3eb] hover:bg-[#e06c53] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-none shadow-sm flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Leave</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('hub')}
                className="rounded-full bg-[#203247] text-[#f6f3eb] hover:bg-[#347f7a] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer border-none shadow-sm flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Back to Hub</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className={`flex-1 flex flex-col w-full ${status !== 'idle' ? 'h-[calc(100vh-66px)] p-2 sm:p-3 max-w-none overflow-hidden min-h-0' : 'max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-5 sm:px-8 pt-4 sm:pt-6 pb-9'}`}>

        {/* VIEW 1: LOBBY & ROOM SELECTOR (When idle) */}
        {status === 'idle' && (
          <div className="flex-1 flex flex-col justify-start pt-2 sm:pt-3 pb-3">

            {/* HERO TITLE SECTION WITH GRID PAPER */}
            <section className={`rounded-3xl border p-7 sm:p-10 mb-7 transition-colors ${isDark ? 'bg-[#111827]/85 bg-grid-paper-dark border-slate-800' : 'bg-[#f5f3ed]/70 bg-grid-paper border-[#203247]/10'}`}>
              <p className="font-mono-signal text-[10px] uppercase tracking-[0.2em] text-[#347f7a] font-medium mb-3">
                THE SIGNAL MESH ROOM
              </p>

              <h1 className={`max-w-4xl font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] ${isDark ? 'text-white' : 'text-[#203247]'}`}>
                Multi-peer mesh, zero servers, <span className="text-[#347f7a] italic font-normal">instant signal.</span>
              </h1>

              <p className={`mt-4 max-w-2xl text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#526b88]'}`}>
                Direct browser-to-browser encrypted mesh communication via WebRTC. Messages exist purely in volatile memory — when you close this window, every trace vanishes forever.
              </p>

              {/* Call-Sign Handle Customizer */}
              <div className={`mt-8 flex flex-wrap items-center gap-3 p-4 rounded-2xl border max-w-lg shadow-xs transition-colors ${isDark ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white/80 border-[#203247]/10 text-[#203247]'}`}>
                <span className={`font-mono-signal text-xs uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#647895]'}`}>
                  Your Call-Sign:
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-mono-signal text-sm text-[#347f7a] font-bold">@</span>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value.replace(/\s+/g, ''))}
                    maxLength={16}
                    className={`w-full bg-transparent border-b focus:border-[#347f7a] focus:outline-none font-space-grotesk font-semibold text-sm pb-1 ${isDark ? 'text-white border-slate-600' : 'text-[#203247] border-[#203247]/20'}`}
                    placeholder="Enter call sign"
                  />
                </div>
                <button
                  onClick={() => setUserName('Learner-' + Math.floor(100 + Math.random() * 900))}
                  title="Randomize call-sign"
                  className={`p-1.5 rounded-full transition-colors cursor-pointer border-none ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-[#203247]/5 text-[#647895] hover:text-[#203247]'}`}
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </section>

            {/* 2 MAIN CARDS: CREATE ROOM vs JOIN WITH CODE */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* Card 1: Create a Room */}
              <div className={`group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-2xl border p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#0e2722] border-[#347f7a]/30' : 'bg-[#D8E6DD] border-[#203247]/10'}`}>
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${isDark ? 'border-emerald-500/20 bg-emerald-950/50' : 'border-[#203247]/10 bg-white/50'}`}>
                    <Radio size={22} strokeWidth={1.5} className={isDark ? 'text-emerald-400' : 'text-[#203247]'} />
                  </div>
                  <span className={`font-mono-signal text-[9px] uppercase tracking-widest font-medium ${isDark ? 'text-emerald-400/80' : 'text-[#203247]/60'}`}>
                    HOST LINK
                  </span>
                </div>

                <div>
                  <p className="font-mono-signal text-[9px] uppercase tracking-[0.18em] text-[#347f7a] font-medium mb-1">
                    NEW FREQUENCY
                  </p>
                  <h3 className={`font-display text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#203247]'}`}>
                    Create a room
                  </h3>
                  <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#203247]/75'}`}>
                    Generate an instant private channel code and invite another learner or test tab.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        const newRoom = generateRoomCode();
                        try {
                          sessionStorage.setItem(`dsd_p2p_is_host_${newRoom}`, 'true');
                        } catch { }
                        connectToRoom(newRoom, true, maxPeers);
                      }}
                      className="rounded-full bg-[#347f7a] hover:bg-[#2bb5af] text-white px-6 py-3 text-xs font-bold transition-transform hover:-translate-y-0.5 cursor-pointer border-none shadow-md flex items-center gap-2"
                    >
                      <span>Initialize Room</span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Compact Animated Peer Limit Pill */}
                    <div
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-xs transition-all duration-200 ${isDark
                          ? 'bg-slate-900/90 border-slate-700/80 text-white shadow-black/20'
                          : 'bg-white/90 border-[#203247]/15 text-[#203247]'
                        }`}
                      title="Set maximum peer capacity for this room"
                    >
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className={isDark ? 'text-emerald-400' : 'text-[#347f7a]'} />
                        <span className={`font-mono-signal text-[9.5px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-[#647895]'}`}>
                          Max
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (maxPeers > 2) {
                              soundFX.playChime('send');
                              setMaxPeers((prev) => Math.max(2, prev - 1));
                            }
                          }}
                          disabled={maxPeers <= 2}
                          className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-150 cursor-pointer border-none active:scale-75 active:-rotate-12 ${maxPeers <= 2
                              ? 'opacity-30 cursor-not-allowed text-slate-400'
                              : isDark
                                ? 'bg-slate-800 hover:bg-slate-700 text-white hover:scale-110 active:bg-emerald-600'
                                : 'bg-[#203247]/5 hover:bg-[#203247]/10 text-[#203247] hover:scale-110 active:bg-[#347f7a] active:text-white'
                            }`}
                          title="Decrease peer capacity (min 2)"
                        >
                          -
                        </button>

                        <span
                          key={maxPeers}
                          className={`font-mono-signal text-xs font-bold min-w-[28px] text-center animate-pop-scale inline-block ${isDark ? 'text-emerald-300' : 'text-[#347f7a]'
                            }`}
                        >
                          {maxPeers}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (maxPeers < 16) {
                              soundFX.playChime('send');
                              setMaxPeers((prev) => Math.min(16, prev + 1));
                            }
                          }}
                          disabled={maxPeers >= 16}
                          className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-150 cursor-pointer border-none active:scale-75 active:rotate-12 ${maxPeers >= 16
                              ? 'opacity-30 cursor-not-allowed text-slate-400'
                              : isDark
                                ? 'bg-slate-800 hover:bg-slate-700 text-white hover:scale-110 active:bg-emerald-600'
                                : 'bg-[#203247]/5 hover:bg-[#203247]/10 text-[#203247] hover:scale-110 active:bg-[#347f7a] active:text-white'
                            }`}
                          title="Increase peer capacity (max 16)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Join with Code */}
              <div className={`group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-2xl border p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#291b17] border-amber-900/40' : 'bg-[#F4DFC9] border-[#203247]/10'}`}>
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${isDark ? 'border-amber-500/20 bg-amber-950/50' : 'border-[#203247]/10 bg-white/50'}`}>
                    <Users size={22} strokeWidth={1.5} className={isDark ? 'text-amber-400' : 'text-[#203247]'} />
                  </div>
                  <span className={`font-mono-signal text-[9px] uppercase tracking-widest font-medium ${isDark ? 'text-amber-400/80' : 'text-[#203247]/60'}`}>
                    JOIN LINK
                  </span>
                </div>

                <div>
                  <p className="font-mono-signal text-[9px] uppercase tracking-[0.18em] text-[#b3673c] font-medium mb-1">
                    CONNECT
                  </p>
                  <h3 className={`font-display text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#203247]'}`}>
                    Join with code
                  </h3>
                  <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#203247]/75'}`}>
                    Enter the 4–8 character code provided by your peer to link up directly.
                  </p>

                  <form onSubmit={handleJoinSubmit} className="mt-5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={joinCodeInput}
                        onChange={(e) => {
                          setJoinCodeInput(e.target.value.toUpperCase());
                          if (joinError) setJoinError('');
                          if (errorMessage && setErrorMessage) setErrorMessage('');
                        }}
                        placeholder="e.g. SIGNAL-42"
                        className={`flex-1 rounded-full border px-4 py-2.5 text-xs font-mono-signal uppercase font-bold shadow-xs focus:outline-none transition-all ${joinError || errorMessage
                            ? 'border-[#e06c53] ring-2 ring-[#e06c53]/25 animate-shake'
                            : 'focus:border-[#347f7a] border-[#203247]/20 dark:border-slate-700'
                          } ${isDark ? 'bg-slate-900/90 text-white placeholder:text-slate-600' : 'bg-white text-[#203247] placeholder:text-slate-400'}`}
                      />
                      <button
                        type="submit"
                        disabled={!joinCodeInput.trim()}
                        className="rounded-full bg-[#b3673c] hover:bg-[#c97444] text-white disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold transition-transform hover:-translate-y-0.5 cursor-pointer border-none shadow-md shrink-0 flex items-center gap-1.5"
                      >
                        <span>Join</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    {(joinError || errorMessage) && (
                      <div className={`mt-3 flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-mono-signal transition-all animate-shake ${isDark
                          ? 'bg-[#1e1310] border-[#e06c53]/40 text-[#fca5a5] shadow-xs'
                          : 'bg-white/95 border-[#e06c53]/35 text-[#a8321d] shadow-xs'
                        }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e06c53]/15 text-[#e06c53] shrink-0">
                            <AlertCircle size={12} />
                          </span>
                          <span className="text-[11px] font-semibold leading-tight truncate">
                            {joinError || errorMessage}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setJoinError('');
                            if (setErrorMessage) setErrorMessage('');
                          }}
                          className="text-[#e06c53]/70 hover:text-[#e06c53] cursor-pointer border-none bg-transparent p-0.5 shrink-0 transition-colors"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>

            </div>

            {/* RECOMMENDATION BANNER */}
            <div className={`mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border p-6 sm:p-8 transition-colors ${isDark ? 'bg-[#111827] border-slate-800 text-slate-200' : 'bg-[#efeadf] border-[#203247]/10 text-[#203247]'}`}>
              <div className="flex items-start gap-4">
                <Sparkles size={22} className="text-[#e06c53] shrink-0 mt-1" />
                <div>
                  <h4 className={`font-display text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-[#203247]'}`}>
                    How does zero-backend chat work?
                  </h4>
                  <p className={`mt-1 text-xs sm:text-sm max-w-2xl ${isDark ? 'text-slate-400' : 'text-[#526b88]'}`}>
                    Signals travel directly between peers through WebRTC DataChannels and local mesh channels. Zero databases, zero cloud logs, and hardware-level low latency.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: ACTIVE ROOM / CHAT SCREEN */}
        {status !== 'idle' && (
          <div className={`flex-1 flex flex-col rounded-2xl border shadow-sm overflow-hidden h-full w-full min-h-0 transition-colors ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-[#203247]/10'}`}>

            {/* ROOM HEADER BAR */}
            <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 transition-colors ${isDark ? 'border-slate-800 bg-[#162032]/95' : 'border-[#203247]/10 bg-[#f5f3ed]/80'}`}>
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className={`h-10 w-10 rounded-full font-display text-sm font-bold flex items-center justify-center shadow-xs ${status === 'full'
                      ? isDark ? 'bg-red-950/70 text-red-300 border border-red-800/60' : 'bg-red-100 text-red-700'
                      : isDark ? 'bg-[#347f7a] text-white' : 'bg-[#203247] text-[#f6f3eb]'
                    }`}>
                    {status === 'full' ? (
                      <Lock size={17} />
                    ) : peerNames && peerNames.length > 1 ? (
                      <Users size={17} />
                    ) : peerNames && peerNames.length === 1 ? (
                      peerNames[0][0].toUpperCase()
                    ) : peerName ? (
                      peerName[0].toUpperCase()
                    ) : (
                      'P'
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ${isDark ? 'ring-slate-900' : 'ring-white'} ${status === 'connected'
                        ? 'bg-[#347f7a]'
                        : status === 'full'
                          ? 'bg-red-500'
                          : 'bg-[#e06c53] animate-pulse'
                      }`}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-display text-base font-bold leading-tight truncate max-w-[280px] sm:max-w-md md:max-w-xl ${isDark ? 'text-white' : 'text-[#203247]'}`}
                    title={
                      status === 'full'
                        ? 'Room Full'
                        : peerNames && peerNames.length > 0
                          ? peerNames.map((n) => `@${n}`).join('; ')
                          : peerName
                            ? `@${peerName}`
                            : '@Partner'
                    }
                  >
                    {status === 'full'
                      ? 'Room Capacity Reached'
                      : peerNames && peerNames.length > 0
                        ? peerNames.map((n) => `@${n}`).join('; ')
                        : peerName
                          ? `@${peerName}`
                          : '@Partner'}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8.5px] uppercase tracking-wider font-semibold ${status === 'connected'
                        ? (isDark ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-[#d9e8df] text-[#203247]')
                        : status === 'full'
                          ? (isDark ? 'bg-red-950/60 text-red-300 border border-red-800/40' : 'bg-red-100 text-red-700')
                          : (isDark ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' : 'bg-[#f5dec5] text-[#b3673c]')
                      }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status === 'connected' ? 'bg-[#347f7a]' : status === 'full' ? 'bg-red-500' : 'bg-[#e06c53] animate-pulse'
                        }`} />
                      {status === 'connected' ? 'DIRECT P2P ACTIVE' : status === 'full' ? 'ROOM FULL' : 'WAITING FOR PEER'}
                    </span>
                    {status !== 'connected' && (
                      <span className={`font-mono-signal text-[10.5px] ${isDark ? 'text-slate-400' : 'text-[#647895]'}`}>
                        {statusMessage || (status === 'full' ? 'Participant limit reached' : 'Waiting for partner to link...')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons in Room Header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  title={`Copy room link for ${roomCode || 'this room'}`}
                  className={`group rounded-xl border px-3 py-1.5 transition-all cursor-pointer shadow-xs flex items-center gap-2.5 text-left ${isDark ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 hover:border-[#347f7a]/50 text-white' : 'bg-white hover:bg-[#f5f3ed] border-[#203247]/15 hover:border-[#347f7a]/40 text-[#203247]'}`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0 ${isDark ? 'bg-slate-900 group-hover:bg-[#347f7a]/20' : 'bg-[#203247]/5 group-hover:bg-[#347f7a]/10'}`}>
                    {copied ? <Check size={14} className="text-[#347f7a]" /> : <Copy size={14} className={isDark ? 'text-slate-300' : 'text-[#203247]'} />}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className={`font-mono-signal text-[9px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-[#647895]'}`}>
                      {copied ? 'Link Copied!' : 'Share Room Link'}
                    </span>
                    <span className={`font-mono-signal text-xs font-bold tracking-wider ${isDark ? 'text-emerald-400' : 'text-[#203247]'}`}>
                      {roomCode || 'SIGNAL'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* IF ROOM IS FULL: Dedicated Rejection Screen */}
            {status === 'full' ? (
              <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center transition-colors ${isDark ? 'bg-[#0b0f19] bg-grid-paper-dark' : 'bg-[#faf8f4] bg-grid-paper'}`}>
                <div className={`p-5 rounded-3xl border shadow-lg max-w-md w-full mx-auto space-y-4 ${isDark ? 'bg-[#111827] border-red-900/40 text-slate-200' : 'bg-white border-red-100 text-[#203247]'}`}>
                  <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-red-950/60 text-red-400 border border-red-800/40' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    <Lock size={32} />
                  </div>

                  <div>
                    <h3 className={`font-display text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#203247]'}`}>
                      Room at Full Capacity
                    </h3>
                    <p className={`mt-2 font-mono-signal text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#526b88]'}`}>
                      Room <span className="font-bold text-[#e06c53]">[{roomCode}]</span> has reached its maximum limit of <span className="font-bold">{maxPeers} peers</span>.
                    </p>
                    <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Access is restricted to prevent exceeding the designated peer mesh limit.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleLeave}
                      className="w-full sm:w-auto rounded-full bg-[#203247] hover:bg-[#347f7a] text-white px-6 py-2.5 text-xs font-bold transition-all cursor-pointer border-none shadow-md flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={14} />
                      <span>Return to Lobby</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* MESSAGES SCROLL CONTAINER */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex-1 p-6 overflow-y-auto space-y-4 min-h-0 no-scrollbar transition-colors ${isDark ? 'bg-[#0b0f19] bg-grid-paper-dark' : 'bg-[#faf8f4] bg-grid-paper'} ${dragOver ? 'ring-2 ring-[#347f7a] bg-[#347f7a]/10' : ''
                    }`}
                >
                  {/* Security Badge in Feed */}
                  <div className={`flex items-center justify-center gap-2 py-1 px-3 rounded-full border w-fit mx-auto text-[10px] font-mono-signal ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-[#efeadf] border-[#203247]/10 text-[#526b88]'}`}>
                    <ShieldCheck size={13} className="text-[#347f7a]" />
                    <span>Zero server logs. Closing tab permanently purges history.</span>
                  </div>

                  {/* Connecting Standby State (Only if 0 messages and connection takes > 500ms) */}
                  {showConnectingBanner && (
                    <div className="my-10 text-center space-y-3 animate-in fade-in duration-300">
                      <div
                        className={`inline-flex p-3 rounded-full border ${isDark
                            ? 'bg-amber-950/40 border-amber-800/50 text-amber-400'
                            : 'bg-[#f5dec5] border-[#203247]/10 text-[#b3673c]'
                          }`}
                      >
                        <RefreshCw size={20} className="animate-spin" />
                      </div>
                      <h4 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-[#203247]'}`}>
                        Waiting for partner in room [{roomCode}]
                      </h4>
                      <p className={`font-mono-signal text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-[#647895]'}`}>
                        {statusMessage || 'Share your room code or click "Share Room Link" above.'}
                      </p>
                    </div>
                  )}
                               {/* Message Bubbles */}
                  {messages.map((msg) => {
                    const reactionEntries = Object.entries(msg.reactions || {}).filter(([_, users]) => users && users.length > 0);
                    return (
                      <div
                        key={msg.id}
                        id={`msg-${msg.id}`}
                        className={`group/msg relative flex flex-col ${msg.isMine ? 'items-end' : 'items-start'} transition-all py-1 px-1 rounded-2xl`}
                      >
                        {/* Sender & Timestamp */}
                        <div className={`flex items-center gap-2 mb-1 px-1 ${msg.isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className={`font-mono-signal text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-[#647895]'}`}>
                            {msg.isMine ? `@${userName} (You)` : `@${msg.sender}`}
                          </span>
                          <span className={`font-mono-signal text-[9px] ${isDark ? 'text-slate-500' : 'text-[#8fa0b0]'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Bubble Container & Micro Action Bar */}
                        <div className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-lg`}>
                          
                          {/* Row: Bubble + Micro Action Bar */}
                          <div className={`flex items-end gap-1.5 ${msg.isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Message Bubble */}
                            <div
                              onDoubleClick={() => {
                                setReplyingTo(msg);
                                messageInputRef.current?.focus();
                              }}
                              className={`rounded-2xl p-3.5 sm:p-4 text-sm break-words shadow-xs transition-all select-text ${msg.isMine
                                  ? 'bg-[#347f7a] text-white rounded-tr-xs'
                                  : isDark
                                    ? 'bg-[#1e293b] border border-slate-700/80 text-slate-100 rounded-tl-xs'
                                    : 'bg-white border border-[#203247]/10 text-[#1C2C35] rounded-tl-xs'
                                }`}
                            >
                              {/* Quoted Replied-To Message */}
                              {msg.replyTo && (
                                <div
                                  onClick={() => {
                                    const targetEl = document.getElementById(`msg-${msg.replyTo.id}`);
                                    if (targetEl) {
                                      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      targetEl.classList.add('ring-2', 'ring-[#347f7a]', 'bg-[#347f7a]/15', 'rounded-2xl', 'transition-all', 'duration-300');
                                      setTimeout(() => {
                                        targetEl.classList.remove('ring-2', 'ring-[#347f7a]', 'bg-[#347f7a]/15');
                                      }, 1400);
                                    }
                                  }}
                                  className={`mb-2.5 cursor-pointer rounded-xl p-2.5 text-xs transition-all flex items-stretch gap-2.5 group/quote select-none ${msg.isMine
                                      ? 'bg-black/25 hover:bg-black/35 text-white/95'
                                      : isDark
                                        ? 'bg-slate-900/70 hover:bg-slate-900 text-slate-200 border border-slate-700/60'
                                        : 'bg-[#203247]/5 hover:bg-[#203247]/10 text-[#203247] border border-[#203247]/10'
                                    }`}
                                  title="Click to jump to original message"
                                >
                                  <div className={`w-1 rounded-full shrink-0 ${msg.isMine ? 'bg-white/90' : 'bg-[#347f7a]'}`} />
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 font-mono-signal text-[10.5px] font-bold">
                                      <Reply size={11} className={msg.isMine ? 'text-white/90' : 'text-[#347f7a]'} />
                                      <span className={msg.isMine ? 'text-white' : 'text-[#347f7a]'}>
                                        @{msg.replyTo.sender}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug opacity-85">
                                      {msg.replyTo.file && !msg.replyTo.text ? `📎 ${msg.replyTo.file.name}` : msg.replyTo.text}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Attached File/Image preview */}
                              {msg.file && (
                                <div className="mb-2">
                                  {msg.file.type?.startsWith('image/') ? (
                                    <img
                                      src={msg.file.data}
                                      alt="Attachment"
                                      className="max-h-60 rounded-xl border border-black/10 object-cover cursor-pointer hover:opacity-95"
                                      onClick={() => {
                                        const w = window.open('');
                                        w.document.write(`<img src="${msg.file.data}" style="max-width:100%;height:auto;" />`);
                                      }}
                                    />
                                  ) : (
                                    <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-mono-signal text-xs ${msg.isMine
                                        ? 'bg-white/10 border-white/15 text-white'
                                        : isDark
                                          ? 'bg-slate-900/80 border-slate-700 text-slate-200'
                                          : 'bg-[#f6f3eb] border-[#203247]/10 text-[#203247]'
                                      }`}>
                                      <Paperclip size={14} className="text-[#347f7a]" />
                                      <div className="flex-1 truncate">
                                        <p className="font-semibold truncate">{msg.file.name}</p>
                                        <p className="text-[10px] opacity-70">{msg.file.size}</p>
                                      </div>
                                      <a
                                        href={msg.file.data}
                                        download={msg.file.name}
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${msg.isMine ? 'bg-white text-[#203247]' : 'bg-[#203247] text-[#f6f3eb]'
                                          }`}
                                      >
                                        Download
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Text Message */}
                              {msg.text && <p className="leading-relaxed whitespace-pre-wrap text-sm">{msg.text}</p>}
                            </div>

                            {/* Micro Action Bar (Emoji & Reply) */}
                            <div className="relative reaction-popover-anchor opacity-0 group-hover/msg:opacity-100 transition-all duration-150 transform scale-90 group-hover/msg:scale-100 shrink-0 mb-1 flex items-center gap-1">
                              {/* Emoji reaction trigger button */}
                              <button
                                type="button"
                                onClick={() => setActiveReactionMenuMsgId(activeReactionMenuMsgId === msg.id ? null : msg.id)}
                                title="Add reaction"
                                className={`h-7 w-7 rounded-full flex items-center justify-center border shadow-xs transition-all cursor-pointer ${
                                  activeReactionMenuMsgId === msg.id
                                    ? 'bg-[#347f7a] text-white border-[#347f7a]'
                                    : isDark
                                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                                      : 'bg-white hover:bg-slate-100 border-[#203247]/15 text-[#647895] hover:text-[#203247]'
                                }`}
                              >
                                <Smile size={13} />
                              </button>

                              {/* Reply button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(msg);
                                  messageInputRef.current?.focus();
                                }}
                                title={`Reply to @${msg.sender} (or double-click)`}
                                className={`h-7 w-7 rounded-full flex items-center justify-center border shadow-xs transition-all cursor-pointer ${isDark
                                    ? 'bg-slate-800 hover:bg-[#347f7a] border-slate-700 text-slate-300 hover:text-white'
                                    : 'bg-white hover:bg-[#347f7a] border-[#203247]/15 text-[#647895] hover:text-white'
                                  }`}
                              >
                                <Reply size={12} />
                              </button>

                              {/* Floating Reaction Quick Bar Popover */}
                              {activeReactionMenuMsgId === msg.id && (
                                <div
                                  className={`absolute z-30 bottom-8 ${msg.isMine ? 'right-0' : 'left-0'} flex items-center gap-1 p-1.5 rounded-full border shadow-xl backdrop-blur-md animate-in zoom-in-90 duration-150 ${
                                    isDark ? 'bg-slate-900/95 border-slate-700 text-white shadow-black/50' : 'bg-white/95 border-[#203247]/15 text-[#203247] shadow-xl'
                                  }`}
                                >
                                  {QUICK_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => {
                                        sendReaction(msg.id, emoji);
                                        setActiveReactionMenuMsgId(null);
                                      }}
                                      className="h-7 w-7 rounded-full hover:scale-125 transition-transform flex items-center justify-center text-base cursor-pointer border-none bg-transparent active:scale-95"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Reaction Badges Below Bubble (Independent row) */}
                          {reactionEntries.length > 0 && (
                            <div className={`flex flex-wrap items-center gap-1.5 mt-1.5 px-0.5 ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                              {reactionEntries.map(([emoji, users]) => {
                                const hasMine = users.includes(userName);
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => sendReaction(msg.id, emoji)}
                                    title={users.map((u) => (u === userName ? 'You' : `@${u}`)).join(', ')}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono-signal transition-all cursor-pointer border shadow-2xs select-none hover:scale-105 active:scale-95 ${
                                      hasMine
                                        ? (isDark ? 'bg-[#347f7a]/30 border-[#347f7a] text-emerald-300' : 'bg-[#347f7a]/15 border-[#347f7a]/60 text-[#203247] font-bold')
                                        : (isDark ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 border-[#203247]/15 text-[#203247]')
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span className="text-[10.5px] opacity-80">{users.length}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator Bubble */}
                  {isPeerTyping && (
                    <div className="flex items-center gap-2 text-xs font-mono-signal text-[#347f7a] py-1">
                      <div className={`flex gap-1 items-center px-3 py-1.5 rounded-full border shadow-xs ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-[#203247]/10 text-[#647895]'}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#347f7a] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#347f7a] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#347f7a] animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="ml-1 text-[10px]">{peerName} is typing...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Active Replying Preview Banner */}
                {replyingTo && (
                  <div className={`shrink-0 px-5 py-2.5 border-t flex items-center justify-between text-xs font-mono-signal animate-in slide-in-from-bottom-2 duration-150 ${isDark ? 'bg-[#141e30] border-slate-800 text-slate-200' : 'bg-[#f0ebe1] border-[#203247]/10 text-[#203247]'
                    }`}>
                  <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                    <div className="w-1 self-stretch rounded-full bg-[#347f7a] shrink-0" />
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#347f7a]/15 text-[#347f7a] shrink-0">
                      <Reply size={13} />
                    </div>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[11px] text-[#347f7a]">
                          Replying to @{replyingTo.sender}
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-black/5 text-[#647895]'}`}>
                          Esc to cancel
                        </span>
                      </div>
                      <span className={`truncate text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-[#526b88]'}`}>
                        {replyingTo.file && !replyingTo.text ? `📎 ${replyingTo.file.name}` : replyingTo.text}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none shrink-0 ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-[#203247]/10 text-slate-500 hover:text-[#203247]'
                      }`}
                    title="Cancel reply (Esc)"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

                {/* Pending Attachment / Pasted Image Preview Chip */}
                {fileAttachment && (
                  <div className={`shrink-0 px-5 py-2.5 border-t flex items-center justify-between text-xs font-mono-signal animate-in slide-in-from-bottom-2 duration-150 ${
                    isDark ? 'bg-[#151f30] border-slate-800 text-slate-200' : 'bg-[#f0ebe1] border-[#203247]/10 text-[#203247]'
                  }`}>
                    <div className="flex items-center gap-3 truncate min-w-0">
                      {fileAttachment.type?.startsWith('image/') && fileAttachment.data ? (
                        <img
                          src={fileAttachment.data}
                          alt="Preview"
                          className="h-9 w-9 rounded-lg object-cover border border-black/10 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#347f7a]/15 text-[#347f7a] shrink-0">
                          <Paperclip size={16} />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="truncate font-bold text-xs">
                          {fileAttachment.name}
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#647895]'}`}>
                          {fileAttachment.size} • Ready to send with message
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFileAttachment(null)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none shrink-0 ${
                        isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-[#203247]/10 text-slate-500 hover:text-[#203247]'
                      }`}
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* INPUT COMPOSER */}
                <div className={`relative shrink-0 p-4 border-t transition-colors ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-[#203247]/10'}`}>
                  
                  {/* Composer Emoji Picker Popover Drawer */}
                  {showComposerEmoji && (
                    <div className={`composer-emoji-anchor absolute bottom-18 left-4 z-40 w-72 sm:w-80 max-h-72 overflow-y-auto rounded-2xl border shadow-2xl p-3 space-y-2 backdrop-blur-lg animate-in zoom-in-95 duration-150 ${
                      isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-[#203247]/15 text-[#203247]'
                    }`}>
                      <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/10">
                        <span className="font-mono-signal text-[10px] uppercase font-bold tracking-wider text-[#347f7a]">
                          Select Emoji
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowComposerEmoji(false)}
                          className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 border-none bg-transparent cursor-pointer p-0"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {EMOJI_CATEGORIES.map((cat) => (
                        <div key={cat.name} className="space-y-1">
                          <p className={`font-mono-signal text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#647895]'}`}>
                            {cat.name}
                          </p>
                          <div className="grid grid-cols-7 gap-1">
                            {cat.emojis.map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => {
                                  setInputVal((prev) => prev + em);
                                  messageInputRef.current?.focus();
                                }}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-lg hover:bg-black/5 dark:hover:bg-white/10 hover:scale-120 transition-all border-none bg-transparent cursor-pointer"
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,.pdf,.txt,.json,.csv,.js,.jsx,.ts,.tsx,.py,.c,.cpp"
                      disabled={status !== 'connected'}
                    />

                    {/* Attachment button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={status !== 'connected'}
                      title={status === 'connected' ? 'Attach File / Image' : 'Waiting for connection...'}
                      className={`h-11 w-11 rounded-full border transition-colors flex items-center justify-center shrink-0 ${status !== 'connected' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        } ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-[#f6f3eb] hover:bg-[#efeadf] border-[#203247]/10 text-[#647895] hover:text-[#203247]'}`}
                    >
                      <ImageIcon size={17} />
                    </button>

                    {/* Composer Emoji Picker Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowComposerEmoji((prev) => !prev)}
                      disabled={status !== 'connected'}
                      title="Insert Emoji"
                      className={`composer-emoji-anchor h-11 w-11 rounded-full border transition-colors flex items-center justify-center shrink-0 ${status !== 'connected' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${
                        showComposerEmoji
                          ? 'bg-[#347f7a] text-white border-[#347f7a]'
                          : isDark
                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                            : 'bg-[#f6f3eb] hover:bg-[#efeadf] border-[#203247]/10 text-[#647895] hover:text-[#203247]'
                      }`}
                    >
                      <Smile size={17} />
                    </button>

                    <input
                      type="text"
                      ref={messageInputRef}
                      value={inputVal}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      disabled={status !== 'connected'}
                      placeholder={
                        status === 'connected'
                          ? replyingTo
                            ? `Replying to @${replyingTo.sender}...`
                            : 'Message...'
                          : 'Connecting to room...'
                      }
                      className={`flex-1 rounded-full border focus:border-[#347f7a] focus:outline-none px-5 py-3 text-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-500' : 'bg-[#f6f3eb] border-[#203247]/15 text-[#203247] placeholder:text-slate-400'}`}
                    />

                    <button
                      type="submit"
                      disabled={status !== 'connected' || (!inputVal.trim() && !fileAttachment)}
                      className="h-11 px-5 rounded-full bg-[#347f7a] hover:bg-[#2bb5af] disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shrink-0 flex items-center gap-1.5"
                    >
                      <span>Send</span>
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              </>
            )}

          </div>
        )}
      </main>

      {/* FOOTER (Outer lobby page) */}
      {status === 'idle' && (
        <footer className={`border-t py-7 sm:py-9 px-5 sm:px-8 text-xs transition-colors mt-auto shrink-0 ${isDark ? 'border-slate-800 bg-[#0f172a] text-slate-400' : 'border-[#203247]/10 bg-[#f6f3eb] text-[#526b88]'}`}>
          <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            <div>
              <div className={`font-space-grotesk text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#203247]'}`}>
                signal<span className="text-[#347f7a] font-normal">school</span>
              </div>
              <p className={`mt-3 text-xs leading-relaxed max-w-xs ${isDark ? 'text-slate-400' : 'text-[#526b88]'}`}>
                A small, curious corner of the internet for understanding how computers think.
              </p>
            </div>
            <div className={`flex flex-wrap items-center gap-8 text-xs ${isDark ? 'text-slate-400' : 'text-[#526b88]'}`}>
              <a
                href="#labs"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('hub');
                }}
                className={`transition-colors text-decoration-none font-medium cursor-pointer ${isDark ? 'hover:text-white text-slate-400' : 'hover:text-[#203247] text-[#526b88]'}`}
              >
                Labs
              </a>
              <a
                href="#manifesto"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('hub');
                }}
                className={`transition-colors text-decoration-none font-medium cursor-pointer ${isDark ? 'hover:text-white text-slate-400' : 'hover:text-[#203247] text-[#526b88]'}`}
              >
                Say hello
              </a>
              <span className={`font-mono-signal text-[10px] uppercase tracking-widest font-medium ${isDark ? 'text-slate-500' : 'text-[#526b88]/70'}`}>
                MADE FOR CURIOUS MINDS
              </span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};
