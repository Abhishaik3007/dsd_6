import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import { soundFX } from './chatAudio';

// Generate room codes like "SIGNAL-42" or "ORBIT-88"
export const generateRoomCode = () => {
  const words = ['SIGNAL', 'CIRCUIT', 'ORBIT', 'PRISM', 'VECTOR', 'LOGIC', 'WAVE', 'PULSE', 'NEXUS', 'FLUX'];
  const num = Math.floor(10 + Math.random() * 90);
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}-${num}`;
};

export const registerActiveRoom = (roomCode, maxPeers = 2) => {
  if (!roomCode) return;
  const clean = roomCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  try {
    const regKey = 'dsd_active_rooms';
    const rooms = JSON.parse(localStorage.getItem(regKey) || '{}');
    rooms[clean] = {
      created: Date.now(),
      maxPeers: maxPeers,
      active: true,
    };
    localStorage.setItem(regKey, JSON.stringify(rooms));
  } catch { }
};

export const unregisterActiveRoom = (roomCode) => {
  if (!roomCode) return;
  const clean = roomCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  try {
    const regKey = 'dsd_active_rooms';
    const rooms = JSON.parse(localStorage.getItem(regKey) || '{}');
    delete rooms[clean];
    localStorage.setItem(regKey, JSON.stringify(rooms));
    localStorage.removeItem(`dsd_room_meta_${clean}`);
  } catch { }
};

export const checkRoomActive = (roomCode) => {
  if (!roomCode || typeof roomCode !== 'string') return false;
  const clean = roomCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (clean.length < 3) return false;
  try {
    const regKey = 'dsd_active_rooms';
    const rooms = JSON.parse(localStorage.getItem(regKey) || '{}');
    if (rooms[clean] && rooms[clean].active) {
      if (Date.now() - (rooms[clean].created || 0) < 24 * 60 * 60 * 1000) {
        return true;
      }
    }
    const metaRaw = localStorage.getItem(`dsd_room_meta_${clean}`);
    if (metaRaw) {
      const meta = JSON.parse(metaRaw);
      if (meta && Date.now() - (meta.ts || 0) < 24 * 60 * 60 * 1000) {
        return true;
      }
    }
  } catch { }
  return false;
};

// Storage helpers for per-tab session persistence
const getSessionUsername = () => {
  try {
    const saved = sessionStorage.getItem('dsd_p2p_username');
    if (saved && saved.trim()) return saved.trim();
  } catch { }
  const generated = 'Learner-' + Math.floor(100 + Math.random() * 900);
  try {
    sessionStorage.setItem('dsd_p2p_username', generated);
  } catch { }
  return generated;
};

const getSessionMessages = (room) => {
  if (!room) return [];
  const clean = room.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!clean) return [];
  try {
    const raw = sessionStorage.getItem(`dsd_p2p_msgs_${clean}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { }
  return [];
};

const saveSessionMessages = (room, msgs) => {
  if (!room) return;
  const clean = room.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!clean) return;
  try {
    sessionStorage.setItem(`dsd_p2p_msgs_${clean}`, JSON.stringify(msgs || []));
  } catch {
    // Quota exceeded fallback (strip large file base64 data)
    try {
      const lightweight = (msgs || []).map((m) => {
        if (m.file && m.file.data && m.file.data.length > 30000) {
          return {
            ...m,
            file: {
              ...m.file,
              data: null,
            },
          };
        }
        return m;
      });
      sessionStorage.setItem(`dsd_p2p_msgs_${clean}`, JSON.stringify(lightweight));
    } catch { }
  }
};

const clearSessionMessages = (room) => {
  if (!room) return;
  const clean = room.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  try {
    sessionStorage.removeItem(`dsd_p2p_msgs_${clean}`);
  } catch { }
};

const getSessionPeerNames = (room) => {
  if (!room) return [];
  const clean = room.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!clean) return [];
  try {
    const raw = sessionStorage.getItem(`dsd_p2p_peernames_${clean}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { }
  return [];
};

export const useP2PChat = (initialRoom = '') => {
  const cleanInitialRoom = (initialRoom || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const [roomCode, setRoomCode] = useState(cleanInitialRoom);
  const [userName, setUserName] = useState(() => getSessionUsername());
  const [peerNames, setPeerNames] = useState(() => getSessionPeerNames(cleanInitialRoom));
  const [peerName, setPeerName] = useState(() => {
    const savedNames = getSessionPeerNames(cleanInitialRoom);
    return savedNames.join('; ') || 'Partner';
  });
  const [status, setStatus] = useState(() => (cleanInitialRoom ? 'connecting' : 'idle')); // 'idle' | 'connecting' | 'connected' | 'full'
  const [statusMessage, setStatusMessage] = useState(() => (cleanInitialRoom ? `Linking to room [${cleanInitialRoom}]...` : ''));
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState(() => getSessionMessages(cleanInitialRoom));
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [latency, setLatency] = useState(null); // in ms
  const [packetsCount, setPacketsCount] = useState({ sent: 0, received: 0 });
  const [transportMode, setTransportMode] = useState('local'); // 'mesh' | 'local' | 'p2p'
  const [isHost, setIsHost] = useState(false);
  const [maxPeers, setMaxPeers] = useState(2); // peer capacity limit (2-16)

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const wsRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const presenceIntervalRef = useRef(null);
  const myIdRef = useRef((() => {
    // Persist peer identity per tab so refreshes reuse the same ID
    const key = 'dsd_p2p_tab_id';
    let tabId = sessionStorage.getItem(key);
    if (!tabId) {
      tabId = 'client_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(key, tabId);
    }
    return tabId;
  })());
  const seenMessageIdsRef = useRef(
    new Set(getSessionMessages(cleanInitialRoom).map((m) => m.id).filter(Boolean))
  );
  const isConnectedRef = useRef(false);
  const isConnectingOrConnectedRef = useRef(false);
  const isRejectedRef = useRef(false);
  const storageListenerRef = useRef(null);
  const peersMapRef = useRef(new Map());
  const maxPeersRef = useRef(2);
  const initialRoomRef = useRef(cleanInitialRoom);

  useEffect(() => {
    maxPeersRef.current = maxPeers;
  }, [maxPeers]);

  // Persist userName in sessionStorage whenever it changes
  useEffect(() => {
    if (userName && userName.trim()) {
      try {
        sessionStorage.setItem('dsd_p2p_username', userName.trim());
      } catch { }
    }
  }, [userName]);

  // Persist messages in sessionStorage for the active room
  useEffect(() => {
    if (roomCode) {
      saveSessionMessages(roomCode, messages);
    }
  }, [roomCode, messages]);

  // Persist peerNames in sessionStorage for active room
  useEffect(() => {
    if (roomCode && peerNames.length > 0) {
      try {
        sessionStorage.setItem(`dsd_p2p_peernames_${roomCode}`, JSON.stringify(peerNames));
      } catch { }
    }
  }, [roomCode, peerNames]);

  const staleReaperRef = useRef(null);
  const beforeUnloadRef = useRef(null);

  // Evict peers not seen in the last 12 seconds
  const reapStalePeers = useCallback(() => {
    const now = Date.now();
    let changed = false;
    for (const [id, peer] of peersMapRef.current.entries()) {
      if (now - peer.lastSeen > 12000) {
        peersMapRef.current.delete(id);
        changed = true;
      }
    }
    if (changed) {
      const unique = Array.from(
        new Set(Array.from(peersMapRef.current.values()).map((p) => p.name).filter(Boolean))
      );
      setPeerNames(unique);
      setPeerName(unique.join('; ') || 'Partner');
      if (unique.length === 0 && isConnectedRef.current) {
        isConnectedRef.current = false;
        setStatus('connecting');
        setStatusMessage('Waiting for partner to link...');
      }
    }
  }, []);

  // Record active peer by unique ID
  const recordPeer = useCallback((fromId, name) => {
    if (!fromId) return false;
    if (isRejectedRef.current) return false;
    if (peersMapRef.current.has(fromId)) {
      peersMapRef.current.get(fromId).lastSeen = Date.now();
      return true;
    }
    // Reap stale peers before checking capacity to free ghost slots
    reapStalePeers();
    if (peersMapRef.current.size + 1 >= maxPeersRef.current) {
      return false; // Exceeds capacity
    }
    const cleanName = (name || 'Partner').trim();
    peersMapRef.current.set(fromId, {
      id: fromId,
      name: cleanName,
      lastSeen: Date.now(),
    });
    const unique = Array.from(
      new Set(Array.from(peersMapRef.current.values()).map((p) => p.name).filter(Boolean))
    );
    setPeerNames(unique);
    setPeerName(unique.join('; ') || 'Partner');
    return true;
  }, [reapStalePeers]);

  // Send raw message across all active channels (BroadcastChannel, WebRTC, WebSocket)
  const dispatchPayload = useCallback((payload) => {
    if (isRejectedRef.current && payload.type !== 'leave') {
      return false; // Permanently block outbound packets when rejected
    }

    let delivered = false;
    const packet = {
      ...payload,
      _fromId: myIdRef.current,
      _roomId: roomCode,
      maxPeers: maxPeersRef.current,
    };

    // 1. BroadcastChannel (Same Browser / Tabs)
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(packet);
        delivered = true;
      } catch (err) {
        console.warn('BroadcastChannel send error:', err);
      }
    }

    // 2. LocalStorage Event Bus (Secondary multi-window fallback)
    try {
      const storageKey = `dsd_p2p_bus_${roomCode}`;
      localStorage.setItem(storageKey, JSON.stringify({ ...packet, _ts: Date.now() + Math.random() }));
    } catch { }

    // 3. WebRTC DataChannel (Direct P2P)
    if (connRef.current && connRef.current.open) {
      try {
        connRef.current.send(packet);
        delivered = true;
      } catch (err) {
        console.warn('WebRTC send error:', err);
      }
    }

    // 4. WebSocket Ephemeral Mesh
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(packet));
        delivered = true;
      } catch (err) {
        console.warn('WS send error:', err);
      }
    }

    if (delivered) {
      setPacketsCount((prev) => ({ ...prev, sent: prev.sent + 1 }));
    }
    return delivered;
  }, [roomCode]);

  // Handle incoming message payload from ANY channel
  const handleIncomingPayload = useCallback((data) => {
    if (!isConnectingOrConnectedRef.current) return;
    if (!data || typeof data !== 'object') return;
    if (data._fromId === myIdRef.current) return; // Ignore our own echo
    if (isRejectedRef.current && data.type !== 'room-full') return;

    // Deduplicate chat messages by ID
    if (data.id) {
      if (seenMessageIdsRef.current.has(data.id)) return;
      seenMessageIdsRef.current.add(data.id);
    }

    setPacketsCount((prev) => ({ ...prev, received: prev.received + 1 }));

    // Sync room peer limit
    if (data.maxPeers && typeof data.maxPeers === 'number') {
      setMaxPeers(data.maxPeers);
      maxPeersRef.current = data.maxPeers;
    }

    switch (data.type) {
      case 'room-full': {
        if (data._targetId === myIdRef.current || (!data._targetId && !isConnectedRef.current)) {
          isRejectedRef.current = true;
          isConnectedRef.current = false;
          if (connRef.current) {
            try { connRef.current.close(); } catch { }
            connRef.current = null;
          }
          if (peerRef.current) {
            try { peerRef.current.destroy(); } catch { }
            peerRef.current = null;
          }
          if (presenceIntervalRef.current) {
            clearInterval(presenceIntervalRef.current);
            presenceIntervalRef.current = null;
          }
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
          }
          peersMapRef.current.clear();
          setPeerNames([]);
          setStatus('full');
          setStatusMessage(`Room limit reached (Max ${data.maxPeers || maxPeersRef.current} peers allowed)`);
        }
        break;
      }

      case 'presence':
      case 'handshake': {
        if (isRejectedRef.current) return;

        const isNewPeer = !peersMapRef.current.has(data._fromId);
        // If room is already full and this is a new participant attempting to join
        if (isNewPeer && peersMapRef.current.size + 1 >= maxPeersRef.current) {
          dispatchPayload({
            type: 'room-full',
            maxPeers: maxPeersRef.current,
            _targetId: data._fromId,
          });
          return;
        }

        if (data.name) {
          const accepted = recordPeer(data._fromId, data.name);
          if (!accepted && isNewPeer) {
            dispatchPayload({
              type: 'room-full',
              maxPeers: maxPeersRef.current,
              _targetId: data._fromId,
            });
            return;
          }
        }

        if (!isRejectedRef.current && !isConnectedRef.current) {
          isConnectedRef.current = true;
          setStatus('connected');
          setStatusMessage('Connected directly to peers');
          soundFX.playChime('join');
        }

        // Respond if this was a request
        if (data.replyRequested) {
          dispatchPayload({
            type: 'presence-ack',
            name: userName,
            maxPeers: maxPeersRef.current,
            _targetId: data._fromId,
          });
        }
        break;
      }

      case 'presence-ack': {
        if (isRejectedRef.current) return;
        if (data._targetId && data._targetId !== myIdRef.current) {
          return; // Ignore responses directed to other peers
        }

        const isNewPeerAck = !peersMapRef.current.has(data._fromId);
        if (isNewPeerAck && peersMapRef.current.size + 1 >= maxPeersRef.current) {
          dispatchPayload({
            type: 'room-full',
            maxPeers: maxPeersRef.current,
            _targetId: data._fromId,
          });
          return;
        }

        if (data.name) {
          const accepted = recordPeer(data._fromId, data.name);
          if (!accepted && isNewPeerAck) {
            return;
          }
        }

        if (!isRejectedRef.current && !isConnectedRef.current) {
          isConnectedRef.current = true;
          setStatus('connected');
          setStatusMessage('Connected directly to peers');
          soundFX.playChime('join');
        }
        break;
      }

      case 'chat': {
        if (isRejectedRef.current) return;
        const isKnownPeer = peersMapRef.current.has(data._fromId);
        if (!isKnownPeer && peersMapRef.current.size + 1 >= maxPeersRef.current) {
          dispatchPayload({
            type: 'room-full',
            maxPeers: maxPeersRef.current,
            _targetId: data._fromId,
          });
          return;
        }

        if (data.sender) {
          recordPeer(data._fromId, data.sender);
        }
        const newMsg = {
          id: data.id || Math.random().toString(36).substring(2, 9),
          sender: data.sender || 'Partner',
          text: data.text || '',
          file: data.file || null,
          replyTo: data.replyTo || null,
          timestamp: data.timestamp || Date.now(),
          reactions: data.reactions || {},
          isMine: false,
        };
        setMessages((prev) => [...prev, newMsg]);
        soundFX.playChime('receive');
        break;
      }

      case 'reaction': {
        if (isRejectedRef.current) return;
        const { messageId, emoji, user } = data;
        if (!messageId || !emoji || !user) return;
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            const currentReactions = { ...(m.reactions || {}) };
            const wasAlreadySelected = (currentReactions[emoji] || []).includes(user);

            // Remove this user from all emoji reactions on this message (1 reaction limit)
            Object.keys(currentReactions).forEach((k) => {
              const updatedUsers = (currentReactions[k] || []).filter((u) => u !== user);
              if (updatedUsers.length === 0) {
                delete currentReactions[k];
              } else {
                currentReactions[k] = updatedUsers;
              }
            });

            // If it wasn't already active, add the new reaction
            if (!wasAlreadySelected) {
              currentReactions[emoji] = [...(currentReactions[emoji] || []), user];
            }

            return { ...m, reactions: currentReactions };
          })
        );
        soundFX.playChime('react');
        break;
      }

      case 'typing': {
        setIsPeerTyping(Boolean(data.isTyping));
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsPeerTyping(false);
          }, 2500);
        }
        break;
      }

      case 'ping': {
        dispatchPayload({
          type: 'pong',
          originTime: data.time,
        });
        break;
      }

      case 'pong': {
        if (data.originTime) {
          const rtt = Math.max(1, Date.now() - data.originTime);
          setLatency(rtt);
        }
        break;
      }

      case 'leave': {
        if (data._fromId) {
          peersMapRef.current.delete(data._fromId);
          const unique = Array.from(
            new Set(Array.from(peersMapRef.current.values()).map((p) => p.name).filter(Boolean))
          );
          setPeerNames(unique);
          setPeerName(unique.join('; ') || 'Partner');
          if (unique.length === 0) {
            isConnectedRef.current = false;
            setStatus('connecting');
            setStatusMessage('Waiting for partner to link...');
          }
        }
        soundFX.playChime('leave');
        break;
      }

      default:
        break;
    }
  }, [userName, dispatchPayload, recordPeer]);

  // Ping interval for RTT latency measurement
  useEffect(() => {
    if (status === 'connected') {
      pingIntervalRef.current = setInterval(() => {
        dispatchPayload({
          type: 'ping',
          time: Date.now(),
        });
      }, 2000);

      dispatchPayload({
        type: 'ping',
        time: Date.now(),
      });
    } else {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      setLatency(null);
    }

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [status, dispatchPayload]);

  // Disconnect & cleanup sockets without resetting view
  const cleanupSockets = useCallback(() => {
    isConnectingOrConnectedRef.current = false;
    isRejectedRef.current = false;

    if (storageListenerRef.current) {
      window.removeEventListener('storage', storageListenerRef.current);
      storageListenerRef.current = null;
    }

    if (isConnectedRef.current) {
      try {
        dispatchPayload({ type: 'leave' });
      } catch { }
    }

    isConnectedRef.current = false;
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    if (presenceIntervalRef.current) clearInterval(presenceIntervalRef.current);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (staleReaperRef.current) clearInterval(staleReaperRef.current);
    if (beforeUnloadRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadRef.current);
      beforeUnloadRef.current = null;
    }

    if (connRef.current) {
      try { connRef.current.close(); } catch { }
      connRef.current = null;
    }

    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch { }
      peerRef.current = null;
    }

    if (broadcastChannelRef.current) {
      try { broadcastChannelRef.current.close(); } catch { }
      broadcastChannelRef.current = null;
    }

    if (wsRef.current) {
      try { wsRef.current.close(); } catch { }
      wsRef.current = null;
    }

    peersMapRef.current.clear();
    setPeerNames([]);
    setPeerName('Partner');
    setLatency(null);
  }, [dispatchPayload]);

  // Full disconnect when user explicitly leaves room
  const disconnect = useCallback(() => {
    if (isHost && roomCode) {
      unregisterActiveRoom(roomCode);
    }

    if (roomCode) {
      clearSessionMessages(roomCode);
      try {
        sessionStorage.removeItem(`dsd_p2p_is_host_${roomCode}`);
        sessionStorage.removeItem(`dsd_p2p_peernames_${roomCode}`);
      } catch { }
    }

    // Reset username to a brand new one and update sessionStorage
    try {
      sessionStorage.removeItem('dsd_p2p_username');
    } catch { }
    const freshUser = 'Learner-' + Math.floor(100 + Math.random() * 900);
    setUserName(freshUser);
    try {
      sessionStorage.setItem('dsd_p2p_username', freshUser);
    } catch { }

    cleanupSockets();
    setRoomCode('');
    setStatus('idle');
    setStatusMessage('');
    setMessages([]);
    seenMessageIdsRef.current.clear();
  }, [cleanupSockets, isHost, roomCode]);

  // Connect / Join Room
  const connectToRoom = useCallback(
    (roomToJoin, asHost = true, peerLimit = null) => {
      const cleanRoom = (roomToJoin || roomCode).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (!cleanRoom) {
        setStatusMessage('Please specify a room code');
        return;
      }

      if (peerLimit && typeof peerLimit === 'number') {
        setMaxPeers(peerLimit);
        maxPeersRef.current = peerLimit;
        try {
          localStorage.setItem(
            `dsd_room_meta_${cleanRoom}`,
            JSON.stringify({ maxPeers: peerLimit, ts: Date.now() })
          );
        } catch { }
      } else {
        try {
          const metaRaw = localStorage.getItem(`dsd_room_meta_${cleanRoom}`);
          if (metaRaw) {
            const meta = JSON.parse(metaRaw);
            if (meta && typeof meta.maxPeers === 'number') {
              setMaxPeers(meta.maxPeers);
              maxPeersRef.current = meta.maxPeers;
            }
          }
        } catch { }
      }

      if (asHost) {
        registerActiveRoom(cleanRoom, peerLimit || maxPeersRef.current);
      }

      if (roomCode && roomCode !== cleanRoom) {
        clearSessionMessages(roomCode);
        try {
          sessionStorage.removeItem(`dsd_p2p_is_host_${roomCode}`);
          sessionStorage.removeItem(`dsd_p2p_peernames_${roomCode}`);
        } catch { }
      }

      cleanupSockets();
      isConnectingOrConnectedRef.current = true;
      setRoomCode(cleanRoom);
      setIsHost(asHost);
      try {
        sessionStorage.setItem(`dsd_p2p_is_host_${cleanRoom}`, asHost ? 'true' : 'false');
      } catch { }
      setStatus('connecting');
      setStatusMessage(`Linking to room [${cleanRoom}]...`);
      setErrorMessage('');

      // Restore messages from session (if any exist, e.g. on page refresh)
      const existingMsgs = getSessionMessages(cleanRoom);
      setMessages(existingMsgs);
      existingMsgs.forEach((m) => {
        if (m.id) seenMessageIdsRef.current.add(m.id);
      });
      isConnectedRef.current = false;

      // Reuse the tab-persistent ID so refreshes don't create ghost peers
      const myId = myIdRef.current;

      // Start stale peer reaper (evict ghost peers every 8s)
      if (staleReaperRef.current) clearInterval(staleReaperRef.current);
      staleReaperRef.current = setInterval(reapStalePeers, 8000);

      // Send leave on page close/refresh so host can immediately free the slot
      if (beforeUnloadRef.current) {
        window.removeEventListener('beforeunload', beforeUnloadRef.current);
      }
      beforeUnloadRef.current = () => {
        try {
          const leavePacket = {
            type: 'leave',
            _fromId: myIdRef.current,
            _roomId: cleanRoom,
          };
          if (broadcastChannelRef.current) {
            broadcastChannelRef.current.postMessage(leavePacket);
          }
          const storageKey = `dsd_p2p_bus_${cleanRoom}`;
          localStorage.setItem(storageKey, JSON.stringify({ ...leavePacket, _ts: Date.now() }));
        } catch { }
      };
      window.addEventListener('beforeunload', beforeUnloadRef.current);

      // 1. Setup Local BroadcastChannel (Instant multi-tab detection)
      try {
        const channelName = `signalschool_room_${cleanRoom}`;
        const bc = new BroadcastChannel(channelName);
        broadcastChannelRef.current = bc;

        bc.onmessage = (e) => {
          if (e.data && e.data._fromId !== myIdRef.current) {
            setTransportMode('local');
            handleIncomingPayload(e.data);
          }
        };

        // Broadcast initial presence announcement
        bc.postMessage({
          type: 'presence',
          name: userName,
          replyRequested: true,
          _fromId: myId,
          _roomId: cleanRoom,
        });
      } catch (err) {
        console.warn('BroadcastChannel init error:', err);
      }

      // 2. Setup LocalStorage Fallback Listener for cross-window sync
      if (storageListenerRef.current) {
        window.removeEventListener('storage', storageListenerRef.current);
      }
      const handleStorageEvent = (e) => {
        if (!isConnectingOrConnectedRef.current) return;
        if (e.key === `dsd_p2p_bus_${cleanRoom}` && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            if (data && data._fromId !== myIdRef.current) {
              setTransportMode('local');
              handleIncomingPayload(data);
            }
          } catch { }
        }
      };
      storageListenerRef.current = handleStorageEvent;
      window.addEventListener('storage', handleStorageEvent);

      // Periodic presence broadcast until connected
      presenceIntervalRef.current = setInterval(() => {
        if (!isConnectingOrConnectedRef.current || isRejectedRef.current) {
          if (presenceIntervalRef.current) {
            clearInterval(presenceIntervalRef.current);
            presenceIntervalRef.current = null;
          }
          return;
        }
        dispatchPayload({
          type: 'presence',
          name: userName,
          replyRequested: !isConnectedRef.current,
        });
      }, 1500);

      // 3. Initialize PeerJS WebRTC P2P
      try {
        const hostPeerId = `signalschool-rm-${cleanRoom.toLowerCase()}-host`;
        const myPeerId = asHost ? hostPeerId : `signalschool-rm-${cleanRoom.toLowerCase()}-${myId}`;

        const peer = new Peer(myPeerId, {
          debug: 0,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          if (isRejectedRef.current) {
            try { peer.destroy(); } catch { }
            return;
          }
          if (!asHost) {
            // Attempt connect to host
            try {
              const conn = peer.connect(hostPeerId, { reliable: true });
              connRef.current = conn;

              conn.on('open', () => {
                if (isRejectedRef.current) {
                  try { conn.close(); } catch { }
                  return;
                }
                setTransportMode('p2p');
                isConnectedRef.current = true;
                setStatus('connected');
                setStatusMessage('Direct WebRTC DataChannel active');
                conn.send({
                  type: 'handshake',
                  name: userName,
                  replyRequested: true,
                  _fromId: myIdRef.current,
                });
              });

              conn.on('data', (d) => {
                if (isRejectedRef.current && d?.type !== 'room-full') return;
                handleIncomingPayload(d);
              });
            } catch (err) {
              console.warn('Peer connect error:', err);
            }
          }
        });

        peer.on('connection', (conn) => {
          if (isRejectedRef.current) {
            try { conn.close(); } catch { }
            return;
          }
          // Reject WebRTC connection if room already at capacity
          if (peersMapRef.current.size + 1 >= maxPeersRef.current) {
            conn.on('open', () => {
              conn.send({
                type: 'room-full',
                maxPeers: maxPeersRef.current,
                _targetId: conn.peer,
              });
              setTimeout(() => {
                try { conn.close(); } catch { }
              }, 400);
            });
            return;
          }

          connRef.current = conn;
          conn.on('open', () => {
            if (isRejectedRef.current) {
              try { conn.close(); } catch { }
              return;
            }
            setTransportMode('p2p');
            conn.send({
              type: 'handshake',
              name: userName,
              replyRequested: false,
              _fromId: myIdRef.current,
              maxPeers: maxPeersRef.current,
            });
          });

          conn.on('data', (d) => {
            if (isRejectedRef.current && d?.type !== 'room-full') return;
            handleIncomingPayload(d);
          });
        });

        peer.on('error', (err) => {
          if (isRejectedRef.current) return;
          // If host ID is taken, connect as participant
          if (err.type === 'unavailable-id' && asHost) {
            try {
              sessionStorage.setItem(`dsd_p2p_is_host_${cleanRoom}`, 'false');
            } catch { }
            connectToRoom(cleanRoom, false);
          } else if (err.type === 'peer-unavailable' && !asHost) {
            // Host is offline / vacated, attempt to become host
            try {
              sessionStorage.setItem(`dsd_p2p_is_host_${cleanRoom}`, 'true');
            } catch { }
            connectToRoom(cleanRoom, true);
          } else if (err.type === 'disconnected' || err.type === 'network') {
            try { peer.reconnect(); } catch { }
          }
        });
      } catch (err) {
        console.warn('PeerJS init failed:', err);
      }
    },
    [roomCode, userName, dispatchPayload, handleIncomingPayload, cleanupSockets]
  );

  // Send a chat message
  const sendMessage = (text, file = null, replyTo = null) => {
    if (isRejectedRef.current || !isConnectedRef.current) return;
    if ((!text || !text.trim()) && !file) return;

    const msgId = 'msg_' + Math.random().toString(36).substring(2, 9);
    const cleanReplyTo = replyTo
      ? {
        id: replyTo.id,
        sender: replyTo.sender,
        text: replyTo.text ? (replyTo.text.length > 120 ? replyTo.text.slice(0, 120) + '...' : replyTo.text) : '',
        file: replyTo.file
          ? {
            name: replyTo.file.name,
            type: replyTo.file.type,
          }
          : null,
      }
      : null;

    const payload = {
      type: 'chat',
      id: msgId,
      sender: userName,
      text: text ? text.trim() : '',
      file: file || null,
      replyTo: cleanReplyTo,
      reactions: {},
      timestamp: Date.now(),
    };

    seenMessageIdsRef.current.add(msgId);
    dispatchPayload(payload);

    // Append locally
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        sender: userName,
        text: payload.text,
        file: payload.file,
        replyTo: payload.replyTo,
        reactions: {},
        timestamp: payload.timestamp,
        isMine: true,
      },
    ]);

    soundFX.playChime('send');
    sendTyping(false);
  };

  // Send an emoji reaction to a specific message (1 reaction per user per message)
  const sendReaction = (messageId, emoji) => {
    if (isRejectedRef.current || !isConnectedRef.current) return;
    if (!messageId || !emoji) return;

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const wasAlreadySelected = (currentReactions[emoji] || []).includes(userName);

        // Remove userName from all emoji reactions on this message
        Object.keys(currentReactions).forEach((k) => {
          const updatedUsers = (currentReactions[k] || []).filter((u) => u !== userName);
          if (updatedUsers.length === 0) {
            delete currentReactions[k];
          } else {
            currentReactions[k] = updatedUsers;
          }
        });

        // If it wasn't already active, add the new reaction
        if (!wasAlreadySelected) {
          currentReactions[emoji] = [...(currentReactions[emoji] || []), userName];
        }

        return { ...m, reactions: currentReactions };
      })
    );

    dispatchPayload({
      type: 'reaction',
      messageId,
      emoji,
      user: userName,
    });
    soundFX.playChime('react');
  };

  // Broadcast typing state
  const sendTyping = (isTyping) => {
    if (isRejectedRef.current || !isConnectedRef.current) return;
    dispatchPayload({
      type: 'typing',
      isTyping,
    });
  };

  // Keep a stable ref to the latest connectToRoom so the mount-only effect
  // can call it without needing it in its dependency array (avoids infinite loop).
  const connectToRoomRef = useRef(connectToRoom);
  useEffect(() => {
    connectToRoomRef.current = connectToRoom;
  }, [connectToRoom]);

  // Auto-connect to room from URL — runs once on mount (and StrictMode remount)
  useEffect(() => {
    const room = initialRoomRef.current;
    if (room && room.length >= 3) {
      let shouldBeHost = false;
      try {
        const storedHost = sessionStorage.getItem(`dsd_p2p_is_host_${room}`);
        if (storedHost === 'true') {
          shouldBeHost = true;
        } else if (storedHost === 'false') {
          shouldBeHost = false;
        } else {
          // If first time opening the room link in this tab:
          // Check if room already exists in active rooms
          shouldBeHost = !checkRoomActive(room);
        }
      } catch {
        shouldBeHost = false;
      }

      const timer = setTimeout(() => {
        connectToRoomRef.current(room, shouldBeHost);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup sockets on unmount (not full disconnect — keeps status intact for StrictMode)
  const cleanupSocketsRef = useRef(cleanupSockets);
  useEffect(() => {
    cleanupSocketsRef.current = cleanupSockets;
  }, [cleanupSockets]);

  useEffect(() => {
    return () => {
      cleanupSocketsRef.current();
    };
  }, []);

  return {
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
  };
};
