import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

const DRAFT_TITLE_KEY = "title";
const DRAFT_LINK_KEY = "link";
const DRAFT_CONTENT_KEY = "content";

function getSessionStorageItem(key: string) {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key);
}

function setSessionStorageItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, value);
}

function removeSessionStorageItem(key: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key);
}

export function clearEditorDraft() {
  removeSessionStorageItem(DRAFT_TITLE_KEY);
  removeSessionStorageItem(DRAFT_LINK_KEY);
  removeSessionStorageItem(DRAFT_CONTENT_KEY);
}

export function useEditorDraft(editor: Editor | null) {
  const [title, setTitle] = useState(
    () => getSessionStorageItem(DRAFT_TITLE_KEY) ?? ""
  );
  const [link, setLink] = useState(
    () => getSessionStorageItem(DRAFT_LINK_KEY) ?? ""
  );
  const savedContentRef = useRef(getSessionStorageItem(DRAFT_CONTENT_KEY));

  useEffect(() => {
    setSessionStorageItem(DRAFT_TITLE_KEY, title);
    setSessionStorageItem(DRAFT_LINK_KEY, link);
  }, [link, title]);

  useEffect(() => {
    if (!editor || !savedContentRef.current) return;

    try {
      editor.commands.setContent(JSON.parse(savedContentRef.current));
      savedContentRef.current = null;
    } catch (error) {
      console.error("Failed to restore draft content:", error);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      setSessionStorageItem(DRAFT_CONTENT_KEY, JSON.stringify(editor.getJSON()));
    };

    editor.on("update", updateHandler);
    return () => {
      editor.off("update", updateHandler);
    };
  }, [editor]);

  return {
    title,
    setTitle,
    link,
    setLink,
  };
}
