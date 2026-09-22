"use client";

import React from "react";
import { Send, X, PhoneCall, MessageSquareText } from "lucide-react";
import { openWhatsAppChat } from "@/lib/whatsapp";

interface WhatsAppSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  message: string;
  recipientName?: string;
  title?: string;
  onSuccessOpened?: () => void;
}

export function WhatsAppSendModal({
  isOpen,
  onClose,
  phone,
  message,
  recipientName,
  title = "Pesan Siap Dikirim ke WhatsApp",
  onSuccessOpened,
}: WhatsAppSendModalProps) {
  if (!isOpen || !phone) return null;

  const handleConfirmSend = () => {
    openWhatsAppChat(phone, message);
    if (onSuccessOpened) onSuccessOpened();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200">
            <MessageSquareText className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Siap Dikirim
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Konfirmasi nomor WhatsApp dan pratinjau pesan sebelum membuka aplikasi WhatsApp.
            </p>
          </div>
        </div>

        {/* Target Recipient Info */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          {recipientName && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Tujuan Penerima:</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">{recipientName}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Nomor WhatsApp:
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wide">{phone}</span>
          </div>
        </div>

        {/* Message Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Pratinjau Teks Pesan WhatsApp
          </label>
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200 text-xs leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap font-medium">
            {message}
          </div>
        </div>

        {/* Note info */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
          Menekan tombol dibawah akan membuka aplikasi WhatsApp dengan pesan yang sudah terisi otomatis.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmSend}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Buka WhatsApp &amp; Kirim</span>
          </button>
        </div>

      </div>
    </div>
  );
}
