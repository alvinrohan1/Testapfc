import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Github,
  Terminal,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'github' | 'termux'>('pwa');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Android Installation & APK Hub</h3>
              <p className="text-xs text-slate-400">Run natively on Android phone & export APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3">
          <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('pwa')}
              className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'pwa' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>1-Tap Install (WebAPK)</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'github' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>Cloud APK Build</span>
            </button>
            <button
              onClick={() => setActiveTab('termux')}
              className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'termux' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Termux On-Phone</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: 1-Tap PWA / WebAPK Installation */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-sm text-white">Recommended for Android Users</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Install APFC Smart Test directly to your Android launcher as a standalone WebAPK. It runs in full immersive mode without browser URL bars, stores all notes and tests offline, and requires zero developer tools.
                </p>

                {isInstalled ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Already installed as standalone application!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={install}
                    className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App on Android Now</span>
                  </button>
                ) : (
                  <div className="mt-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-2">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>How to Install on Android Chrome:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                      <li>Tap the <strong>three dots (&vellip;)</strong> in the top-right corner of Chrome.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Tap <strong>"Install"</strong> in the prompt. The app icon appears on your home screen.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Offline & Persistence guarantee */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-slate-200">100% Offline Capability:</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  All uploaded notes, partitioned 5 sets (100 questions), demo tests, scoring logic, and attempt histories persist in your Android phone's local storage database (IndexedDB / LocalStorage). You can take mock tests on airplane mode anytime.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Automated Cloud APK Build */}
          {activeTab === 'github' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 space-y-2">
                <div className="flex items-center gap-2 text-sky-400">
                  <Github className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-sm text-white">Automated GitHub Actions Cloud Build</h4>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  A pre-configured CI/CD workflow is included at <code className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-sky-300">.github/workflows/build-apk.yml</code>. You don't need Android Studio or a PC—GitHub compiles the APK in the cloud for free!
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">
                  3 Steps to Download Debug APK on Your Phone:
                </h5>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <div>
                      <strong className="text-white block">Push/Sync Repository to GitHub</strong>
                      <span className="text-slate-400 text-[11px]">Push this source code repository to your GitHub account.</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <div>
                      <strong className="text-white block">Actions Runner Compiles APK</strong>
                      <span className="text-slate-400 text-[11px]">
                        Go to the <strong>Actions</strong> tab on your repo. The "Build Android APK" workflow runs automatically using Ubuntu + Gradle + OpenJDK 17.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <div>
                      <strong className="text-white block">Download & Install app-debug.apk</strong>
                      <span className="text-slate-400 text-[11px]">
                        Click the finished workflow run, download <strong>APFC-Smart-Test-Debug-APK</strong>, and tap to install on your Android phone!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Termux On-Device Build */}
          {activeTab === 'termux' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2">
                <div className="flex items-center gap-2 text-purple-400">
                  <Terminal className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-sm text-white">Compile APK Directly ON Your Android Phone</h4>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  If you have the Termux app installed on your Android phone, you can build the APK right on your device using command line:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                  <div className="text-slate-500"># 1. Install prerequisites in Termux:</div>
                  <div className="text-emerald-400">pkg update && pkg install nodejs-lts openjdk-17 git</div>
                  <div className="text-slate-500 pt-1"># 2. Build web bundle:</div>
                  <div className="text-emerald-400">npm install && npm run build</div>
                  <div className="text-slate-500 pt-1"># 3. Assemble Android APK:</div>
                  <div className="text-emerald-400">npx cap sync android && cd android && ./gradlew assembleDebug</div>
                </div>

                <button
                  onClick={() =>
                    handleCopy(
                      'pkg update && pkg install nodejs-lts openjdk-17 git\nnpm install && npm run build\nnpx cap sync android && cd android && ./gradlew assembleDebug',
                      'termux'
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
                >
                  {copiedCmd === 'termux' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCmd === 'termux' ? 'Commands Copied!' : 'Copy Termux Build Commands'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Package: com.apfc.smarttest</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
