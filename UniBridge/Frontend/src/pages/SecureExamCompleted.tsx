import { useState } from "react";
import { ShieldCheck, XSquare, Loader2 } from "lucide-react";

const SecureExamCompleted = () => {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);

    // Strategy 1: Try SEB JavaScript API (SEB 2.x / 3.x)
    try {
      const win = window as any;
      if (typeof win.SEB?.quit === "function") {
        win.SEB.quit();
        return;
      }
      if (typeof win.SafeExamBrowser?.security?.quit === "function") {
        win.SafeExamBrowser.security.quit();
        return;
      }
    } catch {
      // SEB API not available, continue to fallback
    }

    // Strategy 2: Force a full-page navigation to the current URL (which is the quitURL).
    // SEB detects quitURL via real HTTP navigation, not React Router's
    // client-side History API changes. A hard reload triggers SEB's URL match.
    try {
      window.location.href = window.location.href;
      // Give SEB a moment to react before trying further fallbacks
      setTimeout(() => {
        // Strategy 3: Try window.close() — works if SEB config allows it
        window.close();

        // Strategy 4: Navigate to a seb:// protocol quit URI (some SEB builds)
        setTimeout(() => {
          try {
            window.location.href = "seb://quit";
          } catch {
            // Protocol not supported — user must close manually
          }
          setClosing(false);
        }, 1000);
      }, 1500);
    } catch {
      window.close();
      setClosing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-xl mx-4 text-center">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
          <ShieldCheck className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Exam Completed Successfully
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Your answers have been submitted securely. You may now close the Safe
          Exam Browser. If the window does not close automatically, use the
          button below.
        </p>

        <div className="space-y-4 max-w-sm mx-auto">
          <button
            onClick={handleClose}
            disabled={closing}
            className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {closing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Closing Safe Exam Browser...
              </>
            ) : (
              <>
                <XSquare className="w-5 h-5" />
                Close Safe Exam Browser
              </>
            )}
          </button>

          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-1">
              Can't close the window?
            </h2>
            <p className="text-xs text-slate-500">
              If the button above doesn't work, close the Safe Exam Browser
              application manually from your operating system, or contact your
              exam administrator.
            </p>
          </div>
        </div>

        <p className="text-slate-600 text-xs mt-8">
          This is a secured exam session. No further navigation is available.
        </p>
      </div>
    </div>
  );
};

export default SecureExamCompleted;
