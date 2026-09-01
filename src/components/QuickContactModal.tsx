import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Phone,
  Zap,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Send,
  X,
} from "lucide-react";
import { Shop } from "../types";

interface QuickContactModalProps {
  shop: Shop;
  onClose: () => void;
  onSelectShopForQuote?: (shop: Shop) => void;
}

export const QuickContactModal: React.FC<QuickContactModalProps> = ({
  shop,
  onClose,
  onSelectShopForQuote,
}) => {
  const [activeMode, setActiveMode] = useState<"sms" | "call">("sms");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("storm");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Clean numbers for tel: and sms:
  const cleanPhone = shop.phone.replace(/[^0-9+]/g, "");
  const cleanEmergencyPhone = shop.emergencyPhone
    ? shop.emergencyPhone.replace(/[^0-9+]/g, "")
    : null;

  // Detect iOS vs standard for sms URI syntax
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  const templates: Record<string, { label: string; text: string; icon: string }> = {
    storm: {
      label: "🚨 Storm Emergency",
      text: `URGENT [Storm Response]: Hi ${shop.name}, I need emergency plow / spreader service for my truck in the ${shop.city} area. Please text or call back ASAP.`,
      icon: "🚨",
    },
    quote: {
      label: "💬 Upfit Quote",
      text: `Hi ${shop.name}, I found your shop on FrameInSteel${typeof shop.hourlyRate === "number" ? ` ($${shop.hourlyRate}/hr rate)` : ""}. I'd like to get an upfit and installation estimate for my truck.`,
      icon: "💬",
    },
    used: {
      label: "📦 Used Parts / Rig",
      text: `Hi ${shop.name}, I saw your used winter equipment listed on FrameInSteel. Is it still available for inspection or purchase?`,
      icon: "📦",
    },
    custom: {
      label: "🔧 General Inquiry",
      text: `Hi ${shop.name}, reaching out via FrameInSteel directory regarding service/fabrication availability.`,
      icon: "🔧",
    },
  };

  const [messageBody, setMessageBody] = useState(templates.storm.text);

  // Handle template selection
  const handleSelectTemplate = (key: string) => {
    setSelectedTemplate(key);
    if (templates[key]) {
      setMessageBody(templates[key].text);
    }
  };

  // Keyboard shortcut to close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Copy helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2500);
  };

  // Construct proper SMS URI
  const smsDelimiter = isIOS ? "&" : "?";
  const smsUri = `sms:${cleanPhone}${smsDelimiter}body=${encodeURIComponent(
    messageBody
  )}`;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-contact-title"
        id="quick-contact-modal"
      >
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <h2
                id="quick-contact-title"
                className="text-base sm:text-lg font-black text-white"
              >
                {shop.name}
              </h2>
              {shop.verified && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Shop</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {shop.address ? `${shop.address}, ` : ""}
                {shop.city}, {shop.state} {shop.zip}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
            id="close-quick-contact-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contact Mode Toggle Tabs */}
        <div className="bg-slate-950/60 p-2 sm:px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveMode("sms")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === "sms"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="mode-sms-tab"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Send SMS Text</span>
            </button>
            <button
              onClick={() => setActiveMode("call")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === "call"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              id="mode-call-tab"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone Call</span>
            </button>
          </div>

          {shop.has247StormResponse && (
            <div className="hidden sm:flex items-center space-x-1 text-[11px] text-red-300 font-bold bg-red-950/60 border border-red-800/80 px-2.5 py-1 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>24/7 Storm Ready</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {activeMode === "sms" ? (
            <div className="space-y-4">
              {/* Template quick pills */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Choose SMS Template:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(templates).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => handleSelectTemplate(key)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        selectedTemplate === key
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-sm"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className="truncate">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message text area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="sms-message-textarea"
                    className="text-[11px] font-bold text-slate-300 uppercase tracking-wider"
                  >
                    Editable SMS Text Body:
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {messageBody.length} characters
                  </span>
                </div>
                <textarea
                  id="sms-message-textarea"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none leading-relaxed resize-none font-sans"
                  placeholder="Type your SMS message to this shop..."
                />
              </div>

              {/* Destination number display */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    SMS Destination Number
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {shop.phone}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(shop.phone, "phone")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 transition-colors"
                  title="Copy number to clipboard"
                  id="copy-sms-number-btn"
                >
                  {copiedType === "phone" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>

              {/* Primary SMS Actions */}
              <div className="space-y-2 pt-1">
                <a
                  href={smsUri}
                  id="direct-launch-sms-link"
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  <span>Launch SMS in Messaging App</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-900 ml-1 opacity-70" />
                </a>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(messageBody, "sms-body")}
                    className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    id="copy-sms-body-btn"
                  >
                    {copiedType === "sms-body" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Message Text Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Message Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleCopy(
                        `To: ${shop.name} (${shop.phone})\n\n${messageBody}`,
                        "all"
                      )
                    }
                    className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-medium transition-colors"
                    title="Copy full message with shop name & number"
                  >
                    {copiedType === "all" ? (
                      <span className="text-emerald-400 font-bold">Copied All!</span>
                    ) : (
                      <span>Copy Full Package</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Browser support tip */}
              <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2">
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Device Compatibility:</strong> On smartphones and tablets, clicking{" "}
                  <em>Launch SMS</em> opens your native Messages app with text prefilled. On desktop (Mac/Windows), it routes to iMessage, Phone Link, or Skype. You can also use the <strong>Copy</strong> buttons to paste anywhere.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Office Line Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Main Shop & Service Desk
                      </span>
                      <span className="text-base font-mono font-black text-white">
                        {shop.phone}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    Mon-Fri Business Hours
                  </span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <a
                    href={`tel:${cleanPhone}`}
                    id="call-main-phone-link"
                    className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Phone className="w-4 h-4 text-slate-950" />
                    <span>Call Main Line Now</span>
                  </a>
                  <button
                    onClick={() => handleCopy(shop.phone, "main-phone")}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs transition-colors"
                    title="Copy phone number"
                    id="copy-main-phone-btn"
                  >
                    {copiedType === "main-phone" ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 24/7 Emergency Storm Dispatch Line (if available) */}
              {shop.emergencyPhone && (
                <div className="bg-red-950/30 border border-red-900/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40">
                        <Zap className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] text-red-300 font-black uppercase tracking-wider block">
                          ⚡ 24/7 Storm Breakdown Line
                        </span>
                        <span className="text-base font-mono font-black text-white">
                          {shop.emergencyPhone}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-amber-300 bg-red-950 px-2 py-1 rounded border border-red-800">
                      Emergency Only
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href={`tel:${cleanEmergencyPhone}`}
                      id="call-emergency-phone-link"
                      className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-red-600/30"
                    >
                      <Zap className="w-4 h-4 text-white" />
                      <span>Call 24/7 Emergency Line</span>
                    </a>
                    <button
                      onClick={() =>
                        handleCopy(shop.emergencyPhone!, "emergency-phone")
                      }
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs transition-colors"
                      title="Copy emergency number"
                      id="copy-emergency-phone-btn"
                    >
                      {copiedType === "emergency-phone" ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Email Direct Option */}
              {shop.email && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Shop Email
                      </span>
                      <span className="text-xs font-mono text-slate-200">
                        {shop.email}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`mailto:${shop.email}?subject=${encodeURIComponent(
                      `Inquiry via FrameInSteel - ${shop.name}`
                    )}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center space-x-1 transition-colors"
                  >
                    <span>Email Shop</span>
                  </a>
                </div>
              )}

              {/* Browser dialer info */}
              <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Instant Calling:</strong> Tapping <em>Call Now</em> triggers your device's native telephone dialer (or desktop telephony app like FaceTime or Link to Windows).
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-3 sm:px-5 border-t border-slate-800 flex items-center justify-between">
          {onSelectShopForQuote ? (
            <button
              onClick={() => {
                onClose();
                onSelectShopForQuote(shop);
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1.5 underline decoration-amber-500/40"
              id="switch-to-quote-from-quick-contact-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Or fill full formal RFP quote form</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">
              Verified independent upfitter
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition-colors"
            id="done-quick-contact-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
