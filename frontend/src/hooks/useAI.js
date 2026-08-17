import { useState, useCallback, useRef } from 'react';
import { invokeAI } from '../lib/api';

/**
 * Manages AI chat interaction with streaming response parsing.
 * The server sends plain-text chunked lines like:
 *   "Connected to ..."
 *   "listing files ..."
 *   "files listed successfully..."
 *   "Done!"
 *   "Connection closed"
 */
export function useAI(sandboxId) {
  const [messages, setMessages] = useState([]); // { role, content }
  const [activityLog, setActivityLog] = useState([]); // { text, ts, type }
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef(null);

  const addActivity = (text, type = 'info') => {
    setActivityLog((prev) => [
      ...prev,
      { text, ts: new Date().toLocaleTimeString(), type },
    ]);
  };

  const sendMessage = useCallback(
    async (userText) => {
      if (!userText.trim() || !sandboxId || isThinking) return;

      // Add user message to thread
      setMessages((prev) => [...prev, { role: 'user', content: userText }]);
      setIsThinking(true);
      setActivityLog([]);

      const controller = new AbortController();
      abortRef.current = controller;

      let aiResponse = '';

      try {
        const res = await invokeAI(userText, sandboxId);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Each line is a status message from the server
          const lines = chunk.split('\n').filter((l) => l.trim());

          for (const line of lines) {
            const lower = line.toLowerCase();

            if (lower.includes('connection closed')) {
              addActivity(line, 'success');
            } else if (lower.includes('done')) {
              addActivity(line, 'success');
            } else if (lower.includes('error') || lower.includes('failed')) {
              addActivity(line, 'error');
            } else if (lower.includes('updating files')) {
              addActivity(line, 'update');
            } else if (lower.includes('reading files')) {
              addActivity(line, 'read');
            } else if (lower.includes('listing files')) {
              addActivity(line, 'list');
            } else if (lower.includes('connected')) {
              addActivity(line, 'connect');
            } else {
              addActivity(line, 'info');
            }

            // Collect non-status lines as the "AI response"
            if (
              !lower.includes('connection closed') &&
              !lower.includes('connected to') &&
              lower.includes('successfully') === false &&
              line.trim().length > 0
            ) {
              // Build a readable summary for the chat message
            }

            // When done, synthesize an AI assistant message
            if (lower.includes('done!') || lower.includes('connection closed')) {
              aiResponse = 'Done! Your code has been updated. Check the preview to see the changes.';
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          addActivity(`Error: ${err.message}`, 'error');
          aiResponse = `Sorry, something went wrong: ${err.message}`;
        }
      } finally {
        setIsThinking(false);
        if (aiResponse) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: aiResponse },
          ]);
        }
        abortRef.current = null;
      }
    },
    [sandboxId, isThinking],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setActivityLog([]);
  }, []);

  return { messages, activityLog, isThinking, sendMessage, clearMessages };
}
