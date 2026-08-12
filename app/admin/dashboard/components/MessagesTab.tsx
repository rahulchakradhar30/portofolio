"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Trash2, X, Send, Eye, RefreshCw, CheckCircle, AlertTriangle, FileText, Search } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { ContactMessage, HireRequest, EmailReplyItem } from "@/app/lib/types";

export default function MessagesTab({ inboxType }: { inboxType: 'contact' | 'hire' }) {
  const [activeInbox, setActiveInbox] = useState<"contact" | "hire">("contact");
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "replied">("all");

  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [selectedHire, setSelectedHire] = useState<HireRequest | null>(null);

  // Reply Composer State
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ status: 'success' | 'failed'; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadInbox();
  }, []);

  useEffect(() => {
    setActiveInbox(inboxType);
  }, [inboxType]);

  // Load draft when selecting contact or hire request
  useEffect(() => {
    const currentId = selectedContact?.id || selectedHire?.id;
    if (currentId) {
      const savedDraft = localStorage.getItem(`reply_draft_${currentId}`);
      setReplyText(savedDraft || "");
      setSendResult(null);
      setShowPreview(false);
    } else {
      setReplyText("");
      setSendResult(null);
      setShowPreview(false);
    }
  }, [selectedContact?.id, selectedHire?.id]);

  // Draft autosave
  const handleReplyTextChange = (text: string) => {
    setReplyText(text);
    const currentId = selectedContact?.id || selectedHire?.id;
    if (currentId) {
      if (text.trim()) {
        localStorage.setItem(`reply_draft_${currentId}`, text);
      } else {
        localStorage.removeItem(`reply_draft_${currentId}`);
      }
    }
  };

  const loadInbox = async () => {
    try {
      setLoading(true);
      const [contactRes, hireRes] = await Promise.all([
        adminAPI.getMessages(),
        adminAPI.getHireRequests(),
      ]);

      if (contactRes.success) {
        setContactMessages(contactRes.messages || []);
      }

      if (hireRes.success) {
        setHireRequests(hireRes.hireRequests || []);
      }
    } catch (error) {
      console.error('Error loading inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return 'Unknown time';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const openContactMessage = async (message: ContactMessage) => {
    setSelectedContact(message);
    setSelectedHire(null);
    if (!message.read) {
      const res = await adminAPI.updateMessage(message.id, true);
      if (res.success) {
        setContactMessages((prev) => prev.map((item) => item.id === message.id ? { ...item, read: true } : item));
        setSelectedContact({ ...message, read: true });
      }
    }
  };

  const openHireRequest = async (request: HireRequest) => {
    setSelectedHire(request);
    setSelectedContact(null);
    if (!request.read) {
      const res = await adminAPI.updateHireRequest(request.id, true);
      if (res.success) {
        setHireRequests((prev) => prev.map((item) => item.id === request.id ? { ...item, read: true } : item));
        setSelectedHire({ ...request, read: true });
      }
    }
  };

  const toggleContactRead = async (message: ContactMessage) => {
    const res = await adminAPI.updateMessage(message.id, !message.read);
    if (!res.success) {
      alert(res.error || 'Failed to update message');
      return;
    }

    setContactMessages((prev) => prev.map((item) => item.id === message.id ? { ...item, read: !message.read } : item));
    if (selectedContact?.id === message.id) {
      setSelectedContact({ ...message, read: !message.read });
    }
  };

  const toggleHireRead = async (request: HireRequest) => {
    const res = await adminAPI.updateHireRequest(request.id, !request.read);
    if (!res.success) {
      alert(res.error || 'Failed to update hire request');
      return;
    }

    setHireRequests((prev) => prev.map((item) => item.id === request.id ? { ...item, read: !request.read } : item));
    if (selectedHire?.id === request.id) {
      setSelectedHire({ ...request, read: !request.read });
    }
  };

  const deleteContactMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;
    const res = await adminAPI.deleteMessage(messageId);
    if (res.success) {
      setContactMessages((prev) => prev.filter((item) => item.id !== messageId));
      if (selectedContact?.id === messageId) setSelectedContact(null);
      return;
    }
    alert(res.error || 'Failed to delete message');
  };

  const deleteHireRequest = async (requestId: string) => {
    if (!confirm('Delete this hire request?')) return;
    const res = await adminAPI.deleteHireRequest(requestId);
    if (res.success) {
      setHireRequests((prev) => prev.filter((item) => item.id !== requestId));
      if (selectedHire?.id === requestId) setSelectedHire(null);
      return;
    }
    alert(res.error || 'Failed to delete hire request');
  };

  // Dispatch Email Reply
  const handleSendReply = async (type: 'contact' | 'hire', id: string, customContent?: string) => {
    const contentToSend = customContent || replyText;
    if (!contentToSend.trim()) {
      alert('Please enter a reply message before sending.');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    const res = await adminAPI.sendReply({
      requestType: type,
      ticketId: id,
      replyContent: contentToSend.trim(),
    });

    setIsSending(false);

    if (!res.success) {
      setSendResult({ status: 'failed', message: res.error || 'Failed to dispatch email reply' });
      return;
    }

    const emailStatus = res.emailStatus;
    const newReplyItem: EmailReplyItem = res.reply || {
      id: `reply_${Date.now()}`,
      emailId: `msg_${Date.now()}`,
      content: contentToSend.trim(),
      repliedBy: 'admin',
      repliedAt: new Date().toISOString(),
      emailStatus: emailStatus || 'success',
    };

    if (emailStatus === 'success') {
      setSendResult({ status: 'success', message: 'Reply sent and logged successfully!' });
      // Remove local draft
      localStorage.removeItem(`reply_draft_${id}`);
      setReplyText("");
    } else {
      setSendResult({ status: 'failed', message: 'Reply recorded in database, but SMTP email dispatch failed.' });
    }

    // Update local state for replies
    if (type === 'contact' && selectedContact) {
      const updatedReplies = [...(selectedContact.replies || []), newReplyItem];
      const updatedItem = {
        ...selectedContact,
        replied: true,
        messageStatus: emailStatus === 'success' ? 'Replied' : 'Reply Failed',
        replies: updatedReplies,
      };
      setSelectedContact(updatedItem);
      setContactMessages((prev) => prev.map((item) => item.id === id ? updatedItem : item));
    } else if (type === 'hire' && selectedHire) {
      const updatedReplies = [...(selectedHire.replies || []), newReplyItem];
      const updatedItem = {
        ...selectedHire,
        replied: true,
        messageStatus: emailStatus === 'success' ? 'Replied' : 'Reply Failed',
        status: (selectedHire.status === 'new' ? 'contacted' : selectedHire.status) as HireRequest['status'],
        replies: updatedReplies,
      };
      setSelectedHire(updatedItem);
      setHireRequests((prev) => prev.map((item) => item.id === id ? updatedItem : item));
    }
  };

  // Quick Reply Template Inserter
  const applyTemplate = (templateType: string) => {
    if (selectedContact) {
      const name = `${selectedContact.firstName || ''} ${selectedContact.lastName || ''}`.trim() || 'there';
      const subj = selectedContact.subject || 'your message';
      switch (templateType) {
        case 'ack':
          handleReplyTextChange(`Hello ${name},\n\nThank you for reaching out! I have received your message regarding "${subj}" and will get back to you shortly.\n\nBest regards,\nRahul Chakradhar`);
          break;
        case 'more_info':
          handleReplyTextChange(`Hello ${name},\n\nThank you for your message regarding "${subj}". Could you please provide a few more details so I can assist you better?\n\nBest regards,\nRahul Chakradhar`);
          break;
        case 'resolved':
          handleReplyTextChange(`Hello ${name},\n\nThank you for your patience. I have reviewed and addressed your inquiry regarding "${subj}". Please let me know if you have any further questions.\n\nBest regards,\nRahul Chakradhar`);
          break;
      }
    } else if (selectedHire) {
      const name = selectedHire.fullName || 'there';
      const proj = selectedHire.projectType || 'your project inquiry';
      const comp = selectedHire.companyName ? ` (${selectedHire.companyName})` : '';
      switch (templateType) {
        case 'ack':
          handleReplyTextChange(`Hello ${name},\n\nThank you for submitting your hiring request for ${proj}${comp}! I am reviewing your requirements and will get back to you soon.\n\nBest regards,\nRahul Chakradhar`);
          break;
        case 'schedule':
          handleReplyTextChange(`Hello ${name},\n\nThanks for your hiring request regarding ${proj}${comp}. I would love to schedule a discussion to go over your goals, timeline, and budget. Please let me know a convenient time for you.\n\nBest regards,\nRahul Chakradhar`);
          break;
        case 'followup':
          handleReplyTextChange(`Hello ${name},\n\nFollowing up on your hiring inquiry for ${proj}${comp}. Please let me know if you are still looking to move forward with this project.\n\nBest regards,\nRahul Chakradhar`);
          break;
      }
    }
  };

  const buildContactReplyLink = (message: ContactMessage) => {
    const fullName = `${message.firstName || ''} ${message.lastName || ''}`.trim() || 'there';
    const subject = `Re: ${message.subject || 'Your message'}`;
    const body = [
      `Hi ${fullName},`,
      '',
      'Thank you for reaching out.',
      '',
      'Best regards,',
      'Rahul Chakradhar',
      '',
      '--- Original Message ---',
      message.message || '',
    ].join('\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const buildHireReplyLink = (request: HireRequest) => {
    const subject = `Re: Hiring request - ${request.projectType || 'Project discussion'}`;
    const body = [
      `Hi ${request.fullName || 'there'},`,
      '',
      'Thanks for your hiring request. I reviewed the details and will reply shortly.',
      '',
      'Best regards,',
      'Rahul Chakradhar',
      '',
      '--- Request Summary ---',
      `Company: ${request.companyName || 'Not provided'}`,
      `Project Type: ${request.projectType || 'Not provided'}`,
      `Budget: ${request.budget || 'Not provided'}`,
      `Timeline: ${request.timeline || 'Not provided'}`,
      `Role: ${request.role || 'Not provided'}`,
      '',
      request.description || '',
    ].join('\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(request.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Filtered lists
  const filteredContacts = contactMessages.filter((msg) => {
    const matchesSearch =
      !searchQuery ||
      `${msg.firstName} ${msg.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'unread') return !msg.read;
    if (statusFilter === 'replied') return Boolean(msg.replied);
    return true;
  });

  const filteredHires = hireRequests.filter((req) => {
    const matchesSearch =
      !searchQuery ||
      req.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'unread') return !req.read;
    if (statusFilter === 'replied') return Boolean(req.replied);
    return true;
  });

  const contactUnreadCount = contactMessages.filter((message) => !message.read).length;
  const hireUnreadCount = hireRequests.filter((request) => !request.read).length;

  return (
    <div className="space-y-6">
      {/* Header & Section Selector */}
      <div className="paper-card flex flex-col gap-4 p-4 shadow-none sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">
            Admin Communication Hub
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/65">
            Unified email reply center for Contact Form inquiries and Hire Me requests.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setActiveInbox('contact'); setSelectedContact(null); setSelectedHire(null); }}
            className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
              activeInbox === 'contact'
                ? 'border-[var(--foreground)] bg-[var(--accent)] text-white shadow-sm'
                : 'border-[var(--foreground)]/10 bg-[var(--surface)] text-[var(--foreground)]/70 hover:bg-[var(--surface-soft)]'
            }`}
          >
            Contact Messages ({contactMessages.length}) {contactUnreadCount > 0 && <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{contactUnreadCount} new</span>}
          </button>
          <button
            type="button"
            onClick={() => { setActiveInbox('hire'); setSelectedContact(null); setSelectedHire(null); }}
            className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
              activeInbox === 'hire'
                ? 'border-[var(--foreground)] bg-[var(--accent)] text-white shadow-sm'
                : 'border-[var(--foreground)]/10 bg-[var(--surface)] text-[var(--foreground)]/70 hover:bg-[var(--surface-soft)]'
            }`}
          >
            Hire Requests ({hireRequests.length}) {hireUnreadCount > 0 && <span className="ml-1 rounded-full bg-cyan-600 px-2 py-0.5 text-xs text-white">{hireUnreadCount} new</span>}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/40" />
          <input
            type="text"
            placeholder={`Search ${activeInbox === 'contact' ? 'contact messages' : 'hire requests'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--foreground)]/15 bg-[var(--surface)] pl-9 pr-4 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[var(--foreground)]/60">Filter:</span>
          {(['all', 'unread', 'replied'] as const).map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => setStatusFilter(filterKey)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                statusFilter === filterKey
                  ? 'bg-[var(--foreground)] text-[var(--surface)]'
                  : 'border border-[var(--foreground)]/10 text-[var(--foreground)]/70 hover:bg-[var(--surface-soft)]'
              }`}
            >
              {filterKey}
            </button>
          ))}
          <button
            type="button"
            onClick={loadInbox}
            className="ml-2 inline-flex items-center gap-1 rounded-lg border border-[var(--foreground)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]/70 hover:bg-[var(--surface-soft)]"
            title="Refresh Inbox"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Request Lists */}
      {loading ? (
        <div className="paper-card border-dashed p-12 text-center text-[var(--foreground)]/60 shadow-none">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2 text-[var(--accent)]" />
          Loading requests...
        </div>
      ) : activeInbox === 'contact' ? (
        <div className="space-y-3">
          {filteredContacts.length === 0 ? (
            <div className="paper-card border-dashed p-8 text-center text-[var(--foreground)]/60 shadow-none">
              No contact messages found.
            </div>
          ) : (
            filteredContacts.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`cursor-pointer paper-card p-4 transition-colors ${
                  message.read
                    ? 'border-[var(--foreground)]/10 hover:border-[var(--accent)]'
                    : 'border-[var(--accent)]/50 bg-[var(--surface-soft)]/90 shadow-sm'
                }`}
                onClick={() => openContactMessage(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[var(--foreground)] text-base">{message.subject}</span>
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                        Contact Request
                      </span>
                      {message.replied && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                          <CheckCircle className="h-3 w-3" /> Replied ({message.replies?.length || 1})
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[var(--foreground)]/80">
                      From: {[message.firstName, message.lastName].filter(Boolean).join(' ') || 'Unknown'} &lt;{message.email}&gt;
                    </p>
                    <p className="line-clamp-2 text-sm text-[var(--foreground)]/65">
                      {message.message}
                    </p>
                    <p className="text-xs text-[var(--foreground)]/50 pt-1">{formatDate(message.createdAt)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!message.read && (
                      <span className="rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-bold text-white">
                        New
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleContactRead(message); }}
                      className="rounded-lg border border-[var(--foreground)]/10 px-3 py-1 text-xs font-semibold text-[var(--foreground)]/75 hover:bg-[var(--surface-soft)]"
                    >
                      {message.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteContactMessage(message.id); }}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHires.length === 0 ? (
            <div className="paper-card border-dashed p-8 text-center text-[var(--foreground)]/60 shadow-none">
              No hire requests found.
            </div>
          ) : (
            filteredHires.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`cursor-pointer paper-card p-4 transition-colors ${
                  request.read
                    ? 'border-[var(--foreground)]/10 hover:border-[var(--accent)]'
                    : 'border-cyan-500/50 bg-[var(--surface-soft)]/90 shadow-sm'
                }`}
                onClick={() => openHireRequest(request)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[var(--foreground)] text-base">{request.fullName}</span>
                      <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                        Hire Request
                      </span>
                      {request.companyName && (
                        <span className="rounded-md bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-800">
                          {request.companyName}
                        </span>
                      )}
                      {request.replied && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                          <CheckCircle className="h-3 w-3" /> Replied ({request.replies?.length || 1})
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[var(--foreground)]/80">
                      Project: <span className="font-bold text-[var(--accent)]">{request.projectType}</span> &bull; Email: &lt;{request.email}&gt;
                    </p>
                    <p className="line-clamp-2 text-sm text-[var(--foreground)]/65">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--foreground)]/50 pt-1">
                      <span>Received: {formatDate(request.createdAt)}</span>
                      {request.budget && <span>Budget: {request.budget}</span>}
                      {request.timeline && <span>Timeline: {request.timeline}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!request.read && (
                      <span className="rounded-full bg-cyan-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        New
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleHireRead(request); }}
                      className="rounded-lg border border-[var(--foreground)]/10 px-3 py-1 text-xs font-semibold text-[var(--foreground)]/75 hover:bg-[var(--surface-soft)]"
                    >
                      {request.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteHireRequest(request.id); }}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                      title="Delete request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* CONTACT REQUEST DETAIL & REPLY MODAL */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto" onClick={() => setSelectedContact(null)}>
          <div className="my-8 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl text-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">CONTACT REQUEST</span>
                  <h3 className="text-xl font-bold text-gray-900">{selectedContact.subject}</h3>
                </div>
                <p className="mt-1 text-xs text-gray-500">Submitted: {formatDate(selectedContact.createdAt)}</p>
              </div>
              <button type="button" onClick={() => setSelectedContact(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Existing Message Info */}
              <div className="grid gap-3 rounded-xl border border-gray-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">First Name</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedContact.firstName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last Name</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedContact.lastName || 'Not provided'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer Email (Authoritative Recipient)</p>
                  <p className="break-all text-sm font-bold text-blue-600">{selectedContact.email}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Customer Message</p>
                <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700 shadow-xs">
                  {selectedContact.message}
                </div>
              </div>

              {/* REPLY HISTORY */}
              {selectedContact.replies && selectedContact.replies.length > 0 && (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <FileText className="h-4 w-4 text-emerald-700" />
                    Reply History ({selectedContact.replies.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedContact.replies.map((r) => (
                      <div key={r.id} className="rounded-lg border border-emerald-200 bg-white p-3 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                          <span className="font-semibold text-gray-700">Replied by {r.repliedBy}</span>
                          <span>{formatDate(r.repliedAt)}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-xs text-gray-800 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-100">
                          {r.content}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${r.emailStatus === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {r.emailStatus === 'success' ? (
                              <><CheckCircle className="h-3.5 w-3.5" /> Email Dispatched Successfully</>
                            ) : (
                              <><AlertTriangle className="h-3.5 w-3.5" /> Dispatch Failed (Saved in DB)</>
                            )}
                          </span>
                          {r.emailStatus === 'failed' && (
                            <button
                              type="button"
                              onClick={() => handleSendReply('contact', selectedContact.id, r.content)}
                              disabled={isSending}
                              className="inline-flex items-center gap-1 rounded bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              <RefreshCw className={`h-3 w-3 ${isSending ? 'animate-spin' : ''}`} /> Retry Send
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IN-APP REPLY COMPOSER */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-blue-900">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Reply Composer (Sends via Gmail SMTP)
                  </h4>
                  <span className="text-xs text-gray-500">Draft Autosaved</span>
                </div>

                {/* Quick Templates */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-600">Quick Templates:</span>
                  <button type="button" onClick={() => applyTemplate('ack')} className="rounded border border-blue-200 bg-white px-2 py-1 font-medium text-blue-700 hover:bg-blue-50">
                    Acknowledgment
                  </button>
                  <button type="button" onClick={() => applyTemplate('more_info')} className="rounded border border-blue-200 bg-white px-2 py-1 font-medium text-blue-700 hover:bg-blue-50">
                    Need More Info
                  </button>
                  <button type="button" onClick={() => applyTemplate('resolved')} className="rounded border border-blue-200 bg-white px-2 py-1 font-medium text-blue-700 hover:bg-blue-50">
                    Issue Resolved
                  </button>
                </div>

                {/* Recipient & Subject Info */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Recipient Email (Read-Only)</label>
                    <input type="text" readOnly value={selectedContact.email} className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 font-medium text-gray-700 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Generated Subject</label>
                    <input type="text" readOnly value={`Re: ${selectedContact.subject || 'Your message'}`} className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 font-medium text-gray-700 cursor-not-allowed" />
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <label className="font-semibold text-gray-700">Reply Message</label>
                    <span className="text-gray-400">{replyText.length} characters</span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Type your response to the customer..."
                    value={replyText}
                    onChange={(e) => handleReplyTextChange(e.target.value)}
                    className="w-full rounded-xl border border-blue-200 bg-white p-3 text-sm text-gray-800 focus:border-blue-500 focus:outline-none shadow-xs"
                  />
                </div>

                {/* Notification Result Banner */}
                {sendResult && (
                  <div className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${sendResult.status === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                    <span className="flex items-center gap-1.5">
                      {sendResult.status === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-600" />}
                      {sendResult.message}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-3.5 w-3.5 text-gray-600" />
                      {showPreview ? 'Hide Preview' : 'Preview Email'}
                    </button>
                    <a href={buildContactReplyLink(selectedContact)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                      Open in Gmail
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deleteContactMessage(selectedContact.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReply('contact', selectedContact.id)}
                      disabled={isSending || !replyText.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition"
                    >
                      <Send className={`h-3.5 w-3.5 ${isSending ? 'animate-bounce' : ''}`} />
                      {isSending ? 'Sending Email...' : 'Send Reply'}
                    </button>
                  </div>
                </div>

                {/* Email Preview Modal / Box */}
                {showPreview && (
                  <div className="mt-4 rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-inner space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">HTML Email Preview</p>
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-xs font-sans space-y-3">
                      <p className="font-semibold text-slate-900">To: {selectedContact.email}</p>
                      <p className="font-semibold text-slate-900">Subject: Re: {selectedContact.subject || 'Your message'}</p>
                      <hr className="border-slate-200" />
                      <p>Hello {[selectedContact.firstName, selectedContact.lastName].filter(Boolean).join(' ') || 'Valued Customer'},</p>
                      <div className="p-3 bg-white border-l-4 border-blue-500 rounded border border-slate-200 whitespace-pre-wrap">
                        {replyText || '(Your reply content will appear here...)'}
                      </div>
                      <div className="p-3 bg-slate-100 rounded border border-slate-200 text-slate-600 whitespace-pre-wrap">
                        <p className="font-semibold">Original Message:</p>
                        {selectedContact.message}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIRE REQUEST DETAIL & REPLY MODAL */}
      {selectedHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto" onClick={() => setSelectedHire(null)}>
          <div className="my-8 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl text-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">HIRE ME REQUEST</span>
                  <h3 className="text-xl font-bold text-gray-900">{selectedHire.fullName}</h3>
                </div>
                <p className="mt-1 text-xs text-gray-500">Submitted: {formatDate(selectedHire.createdAt)}</p>
              </div>
              <button type="button" onClick={() => setSelectedHire(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Request Info Fields */}
              <div className="grid gap-3 rounded-xl border border-gray-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Company</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedHire.companyName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Project Type</p>
                  <p className="text-sm font-bold text-purple-700">{selectedHire.projectType}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Applicant Email (Authoritative Recipient)</p>
                  <p className="break-all text-sm font-bold text-blue-600">{selectedHire.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedHire.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Website</p>
                  <p className="break-all text-sm font-semibold text-gray-800">{selectedHire.website || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role Needed</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedHire.role || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Budget</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedHire.budget || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Timeline</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedHire.timeline || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Project Description</p>
                <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700 shadow-xs">
                  {selectedHire.description}
                </div>
              </div>

              {/* REPLY HISTORY */}
              {selectedHire.replies && selectedHire.replies.length > 0 && (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <FileText className="h-4 w-4 text-emerald-700" />
                    Reply History ({selectedHire.replies.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedHire.replies.map((r) => (
                      <div key={r.id} className="rounded-lg border border-emerald-200 bg-white p-3 shadow-xs">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                          <span className="font-semibold text-gray-700">Replied by {r.repliedBy}</span>
                          <span>{formatDate(r.repliedAt)}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-xs text-gray-800 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-100">
                          {r.content}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${r.emailStatus === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {r.emailStatus === 'success' ? (
                              <><CheckCircle className="h-3.5 w-3.5" /> Email Dispatched Successfully</>
                            ) : (
                              <><AlertTriangle className="h-3.5 w-3.5" /> Dispatch Failed (Saved in DB)</>
                            )}
                          </span>
                          {r.emailStatus === 'failed' && (
                            <button
                              type="button"
                              onClick={() => handleSendReply('hire', selectedHire.id, r.content)}
                              disabled={isSending}
                              className="inline-flex items-center gap-1 rounded bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              <RefreshCw className={`h-3 w-3 ${isSending ? 'animate-spin' : ''}`} /> Retry Send
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IN-APP REPLY COMPOSER */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-purple-900">
                    <Mail className="h-4 w-4 text-purple-600" />
                    Reply Composer (Sends via Gmail SMTP)
                  </h4>
                  <span className="text-xs text-gray-500">Draft Autosaved</span>
                </div>

                {/* Quick Templates */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-600">Quick Templates:</span>
                  <button type="button" onClick={() => applyTemplate('ack')} className="rounded border border-purple-200 bg-white px-2 py-1 font-medium text-purple-700 hover:bg-purple-50">
                    Received Ack
                  </button>
                  <button type="button" onClick={() => applyTemplate('schedule')} className="rounded border border-purple-200 bg-white px-2 py-1 font-medium text-purple-700 hover:bg-purple-50">
                    Schedule Call
                  </button>
                  <button type="button" onClick={() => applyTemplate('followup')} className="rounded border border-purple-200 bg-white px-2 py-1 font-medium text-purple-700 hover:bg-purple-50">
                    Follow-up
                  </button>
                </div>

                {/* Recipient & Subject Info */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Applicant Email (Read-Only)</label>
                    <input type="text" readOnly value={selectedHire.email} className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 font-medium text-gray-700 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Generated Subject</label>
                    <input type="text" readOnly value={`Re: Hiring Request — ${selectedHire.projectType || 'Project Inquiry'}`} className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 font-medium text-gray-700 cursor-not-allowed" />
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <label className="font-semibold text-gray-700">Reply Message</label>
                    <span className="text-gray-400">{replyText.length} characters</span>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Type your hiring response..."
                    value={replyText}
                    onChange={(e) => handleReplyTextChange(e.target.value)}
                    className="w-full rounded-xl border border-purple-200 bg-white p-3 text-sm text-gray-800 focus:border-purple-500 focus:outline-none shadow-xs"
                  />
                </div>

                {/* Notification Result Banner */}
                {sendResult && (
                  <div className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${sendResult.status === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                    <span className="flex items-center gap-1.5">
                      {sendResult.status === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-600" />}
                      {sendResult.message}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-3.5 w-3.5 text-gray-600" />
                      {showPreview ? 'Hide Preview' : 'Preview Email'}
                    </button>
                    <a href={buildHireReplyLink(selectedHire)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                      Open in Gmail
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deleteHireRequest(selectedHire.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReply('hire', selectedHire.id)}
                      disabled={isSending || !replyText.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition"
                    >
                      <Send className={`h-3.5 w-3.5 ${isSending ? 'animate-bounce' : ''}`} />
                      {isSending ? 'Sending Email...' : 'Send Reply'}
                    </button>
                  </div>
                </div>

                {/* Email Preview Modal / Box */}
                {showPreview && (
                  <div className="mt-4 rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-inner space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">HTML Email Preview</p>
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-xs font-sans space-y-3">
                      <p className="font-semibold text-slate-900">To: {selectedHire.email}</p>
                      <p className="font-semibold text-slate-900">Subject: Re: Hiring Request — {selectedHire.projectType || 'Project Inquiry'}</p>
                      <hr className="border-slate-200" />
                      <p>Hello {selectedHire.fullName || 'Valued Applicant'},</p>
                      <div className="p-3 bg-white border-l-4 border-purple-500 rounded border border-slate-200 whitespace-pre-wrap">
                        {replyText || '(Your reply content will appear here...)'}
                      </div>
                      <div className="p-3 bg-slate-100 rounded border border-slate-200 text-slate-600 whitespace-pre-wrap">
                        <p className="font-semibold">Original Hiring Inquiry:</p>
                        <p>Company: {selectedHire.companyName || 'N/A'}</p>
                        <p>Project: {selectedHire.projectType}</p>
                        <p>Budget: {selectedHire.budget || 'N/A'} | Timeline: {selectedHire.timeline || 'N/A'}</p>
                        <p className="mt-1">{selectedHire.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

