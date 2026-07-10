import { KeyRound, Moon, RotateCcw, Shield, ToggleLeft } from "lucide-react";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useChatStore } from "../store/chatStore";

export function SettingsPage() {
  const { sessionId, newSession } = useChatStore();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="mt-6 space-y-4">
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Moon className="text-mint" />
            <div><h2 className="font-semibold">Theme</h2><p className="text-sm text-white/54">Dark mode is active by default.</p></div>
          </div>
          <ToggleLeft className="text-white/50" />
        </Card>
        <Card>
          <div className="mb-4 flex items-center gap-3"><KeyRound className="text-mint" /><h2 className="font-semibold">Claude API Key</h2></div>
          <input type="password" placeholder="Set ANTHROPIC_API_KEY in backend .env" className="w-full rounded-lg border-white/10 bg-white/[0.06] text-white placeholder:text-white/36" />
        </Card>
        <Card className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="text-mint" />
            <div><h2 className="font-semibold">Memory</h2><p className="break-all text-sm text-white/54">Current session: {sessionId}</p></div>
          </div>
          <Button variant="soft" icon={<RotateCcw size={16} />} onClick={newSession}>New Session</Button>
        </Card>
      </div>
    </div>
  );
}
