import React, { useState } from 'react';
import {
  X,
  Settings,
  Clock,
  Award,
  Zap,
  Smartphone,
  Eye,
  Trash2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { AppSettings } from '../types/index.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllData
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Exam & Test Settings</h3>
              <p className="text-xs text-slate-400">Configure timer, negative marking, and feedback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* 1. Timer Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Test Timer Duration (per 20-Question Set)</span>
            </label>
            <p className="text-xs text-slate-400">
              Default is 30 minutes for UPSC APFC exam standards.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[15, 20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, defaultTimerMinutes: mins })}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    localSettings.defaultTimerMinutes === mins
                      ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {mins} Mins
                </button>
              ))}
            </div>
          </div>

          {/* 2. Marking Scheme */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Marking Scheme & Negative Marking</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, positiveMark: 1.0, negativeMark: 0.33 })}
                className={`p-3 rounded-xl border text-left transition ${
                  localSettings.positiveMark === 1.0 && localSettings.negativeMark === 0.33
                    ? 'bg-sky-600/20 border-sky-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">Standard UPSC APFC</div>
                <div className="text-[11px] text-slate-400 mt-0.5">+1.0 correct / -0.33 wrong</div>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, positiveMark: 2.0, negativeMark: 0.66 })}
                className={`p-3 rounded-xl border text-left transition ${
                  localSettings.positiveMark === 2.0 && localSettings.negativeMark === 0.66
                    ? 'bg-sky-600/20 border-sky-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">UPSC Prelims Standard</div>
                <div className="text-[11px] text-slate-400 mt-0.5">+2.0 correct / -0.66 wrong</div>
              </button>
            </div>
          </div>

          {/* 3. Feedback Mode */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Answer Feedback Mode</span>
            </label>
            <div className="space-y-2">
              <label
                onClick={() => setLocalSettings({ ...localSettings, feedbackMode: 'immediate' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  localSettings.feedbackMode === 'immediate'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center ${
                  localSettings.feedbackMode === 'immediate' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500'
                }`}>
                  {localSettings.feedbackMode === 'immediate' && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                </div>
                <div>
                  <div className="font-bold text-xs">Immediate Feedback (Practice Mode)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Locks option upon tap and highlights Green (if correct) or Red + Green (if wrong) with instant explanation.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setLocalSettings({ ...localSettings, feedbackMode: 'on_submit' })}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  localSettings.feedbackMode === 'on_submit'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center ${
                  localSettings.feedbackMode === 'on_submit' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500'
                }`}>
                  {localSettings.feedbackMode === 'on_submit' && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                </div>
                <div>
                  <div className="font-bold text-xs">Exam Simulation (On Submit)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Hides answers until final test submission, mimicking real UPSC APFC examination conditions.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Android Features */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Android Phone Preferences</span>
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Haptic Vibration Feedback</div>
                  <div className="text-[11px] text-slate-400">Gentle vibration pulses on selecting options</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.vibrationEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, vibrationEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Keep Screen Awake (Wake Lock)</div>
                  <div className="text-[11px] text-slate-400">Prevents phone display from sleeping during tests</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.wakeLockEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, wakeLockEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-900 border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* 5. Danger Zone: Reset Data */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Saved Notes & Test Histories</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Clear All Local Data?</h4>
            <p className="text-xs text-slate-400">
              This will remove all your saved notes, generated question sets, bookmarks, and past attempt records permanently.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearAllData();
                  onClose();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
