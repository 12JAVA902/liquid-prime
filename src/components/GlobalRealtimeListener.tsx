import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import IncomingCallModal from "@/components/IncomingCallModal";
import { playNotificationTone } from "@/hooks/useRingtone";
import { logSecurityEvent } from "@/utils/audit";

interface Ring {
  callerId: string;
  callerName: string;
  audio?: boolean;
}

/**
 * App-wide realtime listener: incoming WebRTC calls (with ringtone) and
 * live message / notification toasts with a sound.
 */
const GlobalRealtimeListener = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ring, setRing] = useState<Ring | null>(null);

  useEffect(() => {
    if (!user) return;

    const calls = supabase
      .channel(`calls-${user.id}`)
      .on("broadcast", { event: "ring" }, ({ payload }: any) => {
        if (!payload?.callerId) return;
        void logSecurityEvent("realtime", "call_ring_received", payload.callerId, { audio: !!payload.audio });
        setRing({ callerId: payload.callerId, callerName: payload.callerName || "Unknown", audio: payload.audio });
      })
      .on("broadcast", { event: "ring-cancel" }, () => {
        void logSecurityEvent("realtime", "call_ring_cancelled");
        setRing(null);
      })
      .subscribe();

    const inbox = supabase
      .channel(`inbox-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        async ({ new: row }: any) => {
          playNotificationTone();
          void logSecurityEvent("realtime", "message_received", row.sender_id, { message_id: row.id });
          const { data } = await supabase
            .from("profiles")
            .select("display_name, username")
            .eq("user_id", row.sender_id)
            .maybeSingle();
          const name = data?.display_name || data?.username || "New message";
          toast(name, {
            description: String(row.content ?? "").slice(0, 120),
            action: { label: "Open", onClick: () => navigate("/messages") },
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(calls);
      supabase.removeChannel(inbox);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Never overlay the modal while already on a call screen.
  const onCallScreen = location.pathname.startsWith("/call/");

  const decline = () => {
    if (ring && user) {
      void logSecurityEvent("realtime", "call_declined", ring.callerId);
      supabase.channel(`calls-${ring.callerId}`).send({
        type: "broadcast",
        event: "hangup",
        payload: { from: user.id },
      });
    }
    setRing(null);
  };

  return (
    <IncomingCallModal
      isOpen={!!ring && !onCallScreen}
      callerName={ring?.callerName || ""}
      onJoin={() => {
        if (!ring) return;
        const target = `/call/${ring.callerId}?incoming=1${ring.audio ? "&audio=1" : ""}`;
        setRing(null);
        navigate(target);
      }}
      onDecline={decline}
    />
  );
};

export default GlobalRealtimeListener;
