import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Phone, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationApi } from '@ar-multiventures/api';
import type { NotificationChannel, NotificationTemplateType, NotificationPreference } from '@ar-multiventures/types';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const TEMPLATE_LABELS: Array<{ type: NotificationTemplateType; label: string; desc: string }> = [
  { type: 'REQUISITION_APPROVED', label: 'Commercial Order Approvals', desc: 'When quotes and sales prices are approved' },
  { type: 'TRIP_DISPATCHED', label: 'Fleet Departures & In Transit', desc: 'When trucks leave quarry hoppers' },
  { type: 'DELIVERY_COMPLETED', label: 'Proof of Delivery (POD) Offload', desc: 'When material is signed and delivered on site' },
  { type: 'PAYMENT_CONFIRMED', label: 'Electronic Receipts & Statements', desc: 'When Paystack or bank wire is confirmed' },
  { type: 'CREDIT_LIMIT_WARNING', label: 'Credit Limit & Due Date Alerts', desc: 'Trade credit utilization notifications' },
];

export function NotificationPreferencesModal({ isOpen, onClose, userId = 'usr-customer-01' }: NotificationPreferencesModalProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      setIsLoading(true);
      try {
        const data = await notificationApi.getPreferences(userId);
        setPreferences(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const isChannelEnabled = (channel: NotificationChannel, templateType: NotificationTemplateType) => {
    const pref = preferences.find((p) => p.channel === channel && p.templateType === templateType);
    return pref ? pref.isEnabled : channel === 'IN_APP' || channel === 'EMAIL';
  };

  const handleToggle = (channel: NotificationChannel, templateType: NotificationTemplateType) => {
    const current = isChannelEnabled(channel, templateType);
    notificationApi.updatePreference(userId, { channel, templateType, isEnabled: !current });
    setPreferences((prev) => {
      const idx = prev.findIndex((p) => p.channel === channel && p.templateType === templateType);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].isEnabled = !current;
        return copy;
      }
      return [...prev, { id: `pref-${Date.now()}`, userId, channel, templateType, isEnabled: !current }];
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900 text-white flex items-center justify-center font-bold">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-body font-bold text-neutral-950">Notification Preferences</h3>
              <p className="text-caption text-neutral-500">Configure multi-channel operational alert delivery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono font-bold uppercase text-neutral-400 pb-2 border-b border-neutral-100">
            <div className="text-left col-span-2">Alert Category</div>
            <div>In-App</div>
            <div>Email</div>
          </div>

          <div className="space-y-4">
            {TEMPLATE_LABELS.map((item) => (
              <div key={item.type} className="grid grid-cols-4 gap-2 items-center">
                <div className="col-span-2 space-y-0.5">
                  <div className="text-body-sm font-bold text-neutral-900">{item.label}</div>
                  <div className="text-[11px] text-neutral-500">{item.desc}</div>
                </div>

                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={isChannelEnabled('IN_APP', item.type)}
                    onChange={() => handleToggle('IN_APP', item.type)}
                    className="w-4 h-4 text-primary-800 rounded border-neutral-300 focus:ring-primary-800"
                  />
                </div>

                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={isChannelEnabled('EMAIL', item.type)}
                    onChange={() => handleToggle('EMAIL', item.type)}
                    className="w-4 h-4 text-primary-800 rounded border-neutral-300 focus:ring-primary-800"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-caption text-neutral-500">
            <span>SMS & WhatsApp gateways are in active carrier testing.</span>
            <span className="font-mono font-bold text-primary-800">Coming Soon</span>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" onClick={onClose} className="font-bold shadow-2xs">
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
