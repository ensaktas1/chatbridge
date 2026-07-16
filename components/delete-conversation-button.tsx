"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BeuiButton } from "./beui-button";

export function DeleteConversationButton({ id }: { id: string }) {
  const deleteToken = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => window.localStorage.getItem(`chatbridge:delete:${id}`),
    () => null,
  );
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!deleteToken) return null;

  async function deleteConversation() {
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
        headers: { "x-chatbridge-delete-token": deleteToken as string },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The conversation could not be deleted.");
      window.localStorage.removeItem(`chatbridge:delete:${id}`);
      window.location.assign("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The conversation could not be deleted.");
      setDeleting(false);
    }
  }

  return (
    <div className="delete-control">
      <AnimatePresence mode="wait" initial={false}>
        {confirming ? (
          <motion.div
            className="delete-confirm"
            key="confirm"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
          >
            <span>Delete this bridge forever?</span>
            <BeuiButton variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>Cancel</BeuiButton>
            <BeuiButton variant="danger" size="sm" onClick={deleteConversation} disabled={deleting}>
              {deleting ? <><span className="spinner" /> Deleting</> : "Delete forever"}
            </BeuiButton>
          </motion.div>
        ) : (
          <motion.div key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BeuiButton variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              <TrashIcon /> Delete
            </BeuiButton>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <span className="delete-error" role="alert">{error}</span>}
    </div>
  );
}

function TrashIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4.75 6.25h10.5M8 3.75h4m-6.5 2.5.55 9h7.9l.55-9M8.25 9v3.75m3.5-3.75v3.75" /></svg>;
}
