"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Trash2, X, Briefcase } from "lucide-react";
import { adminAPI } from "@/app/lib/adminAPI";
import type { ContactMessage, HireRequest } from "@/app/lib/types";

export default function MessagesTab({ inboxType }: { inboxType: 'contact' | 'hire' }) {
  const [activeInbox, setActiveInbox] = useState<"contact" | "hire">("contact");
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [selectedHire, setSelectedHire] = useState<HireRequest | null>(null);

  useEffect(() => {
    loadInbox();
  }, []);

  useEffect(() => {
    setActiveInbox(inboxType);
  }, [inboxType]);

  const loadInbox = async () => {
    try {
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

  const contactUnreadCount = contactMessages.filter((message) => !message.read).length;
  const hireUnreadCount = hireRequests.filter((request) => !request.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{inboxType === 'contact' ? 'Contact Messages' : 'Hire Requests'}</h2>
          <p className="mt-1 text-sm text-gray-500">Separate contact and hiring requests with direct Gmail reply support.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveInbox('contact')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeInbox === 'contact' ? 'bg-violet-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Contact Messages ({contactMessages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveInbox('hire')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeInbox === 'hire' ? 'bg-cyan-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Hire Requests ({hireRequests.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : activeInbox === 'contact' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Unread: {contactUnreadCount}</span>
            <span>Total: {contactMessages.length}</span>
          </div>

          {contactMessages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">No contact messages yet.</div>
          ) : (
            contactMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`cursor-pointer rounded-lg border bg-white p-4 transition-colors ${message.read ? 'border-gray-200 hover:border-violet-300' : 'border-violet-300 bg-violet-50/40'}`}
                onClick={() => openContactMessage(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{message.subject}</h3>
                    <p className="text-sm text-gray-600">From: {[message.firstName, message.lastName].filter(Boolean).join(' ') || 'Unknown Sender'}</p>
                    <p className="text-sm text-gray-600">Email: {message.email}</p>
                    <p className="mt-2 text-sm text-gray-600">{(message.message || '').slice(0, 120)}{(message.message || '').length > 120 ? '...' : ''}</p>
                    <p className="mt-2 text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!message.read && <span className="rounded-full bg-violet-600 px-2 py-1 text-xs font-semibold text-white">New</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleContactRead(message); }}
                      className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      {message.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteContactMessage(message.id); }}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Unread: {hireUnreadCount}</span>
            <span>Total: {hireRequests.length}</span>
          </div>

          {hireRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">No hire requests yet.</div>
          ) : (
            hireRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`cursor-pointer rounded-lg border bg-white p-4 transition-colors ${request.read ? 'border-gray-200 hover:border-cyan-300' : 'border-cyan-300 bg-cyan-50/40'}`}
                onClick={() => openHireRequest(request)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.fullName}</h3>
                    <p className="text-sm text-gray-600">{request.companyName || 'No company provided'}</p>
                    <p className="text-sm text-gray-600">Project: {request.projectType}</p>
                    <p className="text-sm text-gray-600">Email: {request.email}</p>
                    <p className="mt-2 text-sm text-gray-600">{(request.description || '').slice(0, 120)}{(request.description || '').length > 120 ? '...' : ''}</p>
                    <p className="mt-2 text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!request.read && <span className="rounded-full bg-cyan-600 px-2 py-1 text-xs font-semibold text-white">New</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleHireRead(request); }}
                      className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      {request.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteHireRequest(request.id); }}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedContact(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedContact.subject}</h3>
                <p className="mt-1 text-sm text-gray-500">Received: {formatDate(selectedContact.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedContact(null)} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-5 w-5 text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">First Name</p><p className="text-sm text-gray-800">{selectedContact.firstName || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last Name</p><p className="text-sm text-gray-800">{selectedContact.lastName || 'Not provided'}</p></div>
                <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p><p className="break-all text-sm text-gray-800">{selectedContact.email}</p></div>
              </div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Message</p><div className="whitespace-pre-wrap rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-700">{selectedContact.message}</div></div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={() => toggleContactRead(selectedContact)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{selectedContact.read ? 'Mark Unread' : 'Mark Read'}</button>
                <a href={buildContactReplyLink(selectedContact)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"><Mail className="h-4 w-4" />Reply in Gmail</a>
                <a href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(`Re: ${selectedContact.subject || 'Your message'}`)}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Open Mail App</a>
                <button type="button" onClick={() => deleteContactMessage(selectedContact.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete Message</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedHire(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedHire.fullName}</h3>
                <p className="mt-1 text-sm text-gray-500">Received: {formatDate(selectedHire.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedHire(null)} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-5 w-5 text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Company</p><p className="text-sm text-gray-800">{selectedHire.companyName || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Project Type</p><p className="text-sm text-gray-800">{selectedHire.projectType}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p><p className="break-all text-sm text-gray-800">{selectedHire.email}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</p><p className="text-sm text-gray-800">{selectedHire.phone || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Website</p><p className="break-all text-sm text-gray-800">{selectedHire.website || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Timeline</p><p className="text-sm text-gray-800">{selectedHire.timeline || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Budget</p><p className="text-sm text-gray-800">{selectedHire.budget || 'Not provided'}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role Needed</p><p className="text-sm text-gray-800">{selectedHire.role || 'Not provided'}</p></div>
              </div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Project Description</p><div className="whitespace-pre-wrap rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-700">{selectedHire.description}</div></div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={() => toggleHireRead(selectedHire)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{selectedHire.read ? 'Mark Unread' : 'Mark Read'}</button>
                <a href={buildHireReplyLink(selectedHire)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"><Mail className="h-4 w-4" />Reply in Gmail</a>
                <a href={`mailto:${selectedHire.email}?subject=${encodeURIComponent(`Re: Hiring request - ${selectedHire.projectType || 'Project discussion'}`)}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Open Mail App</a>
                {selectedHire.website && (
                  <a href={selectedHire.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">Open Website</a>
                )}
                <button type="button" onClick={() => deleteHireRequest(selectedHire.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
