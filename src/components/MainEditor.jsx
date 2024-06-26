import React, { useState} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DataFromLocal from "../Storage/DataFromLocal";
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaUnderline,
  FaList,
  FaListOl,
  FaRedo,
  FaUndo,
  FaFonticons,
  FaEyeDropper,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import { useRecoilState } from "recoil";

export default function MainEditor() {
  let nav = useNavigate();
  let [q, setQ] = useSearchParams();
  let [state, setState] = useRecoilState(DataFromLocal);
  const [showFontStyles, setShowFontStyles] = useState(false);
  const CustomDocument = Document.extend({
    content: "heading block*",
  });
  const extensions = [
    StarterKit.configure({
      document: false,
    }),
    FontFamily,
    TextStyle,
    Text,
    Underline,
    Color,
    CustomDocument,
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "heading") {
          return "Please Enter The Title!";
        }
        return "Write Your Content Here";
      },
    }),
  ];
  let preaddedContent =
    localStorage.getItem(q.get("id")) === null
      ? ''
      : JSON.parse(localStorage.getItem(q.get("id"))).content;
  const content = `${preaddedContent}`;
  const editor = useEditor({
    extensions,
    content,
  });
  if (!editor) {
    return null;
  }
  function handleSave() {
    const data = editor.getHTML();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    const firstHeading = doc.querySelector("h1").textContent;
    if(firstHeading === null || firstHeading === ""){
      alert("Please enter a heading for this note before saving it!!");
      return null;
    }
    let meta = Date.now();
    const dateObject = new Date(meta);
    const id = `${firstHeading}_${meta}`;
    let sendData = {
      id:
        localStorage.getItem(q.get("id")) !== null
          ? q.get("id")
          : `${firstHeading}_${meta}`,
      Title: firstHeading,
      content: data,
      date: `${dateObject.getDate()}-${
        dateObject.getMonth() + 1
      }-${dateObject.getFullYear()}`,
      time: `${dateObject.getHours()}:${dateObject.getMinutes()}:${dateObject.getSeconds()}`,
    };
    localStorage.setItem(
      localStorage.getItem(q.get("id")) !== null
        ? q.get("id")
        : `${firstHeading}_${meta}`,
      JSON.stringify(sendData)
    );
    setState(() => ({
      state: "read",
      data:
        localStorage.getItem(q.get("id")) !== null
          ? [...state.data]
          : [...state.data, `${firstHeading}_${meta}`],
    }));
    nav(
      `/ShowSaved?id=${
        localStorage.getItem(q.get("id")) !== null
          ? q.get("id")
          : `${firstHeading}_${meta}`
      }`
    );
  }

  return (
    <div className="Editor_Parent">
      <div className="tools">
        <IconContext.Provider value={{ size: "1.5rem" }}>
          <div>
            <FaEyeDropper style={{ color: " #cbcbcb", marginLeft: "1vw" }} />
            <input
              type="color"
              onInput={(event) =>
                editor.chain().focus().setColor(event.target.value).run()
              }
              value={editor.getAttributes("textStyle").color}
              data-testid="setColor"
            />
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "is-active" : "btns"}
            >
              <FaBold />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "is-active" : "btns"}
            >
              <FaItalic />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "is-active" : "btns"}
            >
              <FaUnderline />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "is-active" : "btns"}
            >
              <FaStrikethrough />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "is-active" : "btns"}
            >
              <FaList />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "is-active" : "btns"}
            >
              <FaListOl />
            </button>
            <button
              onClick={() => setShowFontStyles(!showFontStyles)}
              className={showFontStyles ? "is-active" : "btns"}
            >
              <FaFonticons />
            </button>
          </div>
          <div style={{ display: "flex" }}>
            <button
              className={editor.can().undo() ? "is-active" : "btns"}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <FaUndo />
            </button>
            <button
              className={editor.can().redo() ? "is-active" : "btns"}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <FaRedo />
            </button>
            {(state.state === "edit" || q.get("id") === "newNote") && (
              <button
                style={{ padding: "0px" }}
                className="btns Save_btn"
                onClick={handleSave}
              >
                <i
                  className="fa-solid fa-floppy-disk"
                  style={{ fontSize: "2rem" }}
                />{" "}
                Save
              </button>
            )}
          </div>
          {showFontStyles && (
            <div>
              <BubbleMenu
                className="Float"
                editor={editor}
                tippyOptions={{ duration: 100 }}
              >
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Arial" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Arial").run()
                  }
                >
                  Arial
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Helvetica" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Helvetica").run()
                  }
                >
                  Helvetica
                </button>
                <button
                  className={
                    editor.isActive("textStyle", {
                      fontFamily: "Times New Roman",
                    })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .setFontFamily("Times New Roman")
                      .run()
                  }
                >
                  Times New Roman
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Georgia" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Georgia").run()
                  }
                >
                  Georgia
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Courier New" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Courier New").run()
                  }
                >
                  Courier New
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Comic Sans" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Comic Sans").run()
                  }
                >
                  Comic Sans
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "monospace" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("monospace").run()
                  }
                >
                  monospace
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "cursive" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("cursive").run()
                  }
                >
                  cursive
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Verdana" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Verdana").run()
                  }
                >
                  Verdana
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Arial Black" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Arial Black").run()
                  }
                >
                  Arial Black
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Geneva" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Geneva").run()
                  }
                >
                  Geneva
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Tahoma" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Tahoma").run()
                  }
                >
                  Tahoma
                </button>
                <button
                  className={
                    editor.isActive("textStyle", { fontFamily: "Trebuchet MS" })
                      ? "is-active"
                      : "btns"
                  }
                  onClick={() =>
                    editor.chain().focus().setFontFamily("Trebuchet MS").run()
                  }
                >
                  Trebuchet MS
                </button>
              </BubbleMenu>
            </div>
          )}
          <div>
            <FloatingMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="Float"
            >
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                  editor.isActive("heading", { level: 1 })
                    ? "is-active"
                    : "btns"
                }
              >
                h1
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive("heading", { level: 2 })
                    ? "is-active"
                    : "btns"
                }
              >
                h2
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={
                  editor.isActive("heading", { level: 3 })
                    ? "is-active"
                    : "btns"
                }
              >
                h3
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
                className={
                  editor.isActive("heading", { level: 4 })
                    ? "is-active"
                    : "btns"
                }
              >
                h4
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 5 }).run()
                }
                className={
                  editor.isActive("heading", { level: 5 })
                    ? "is-active"
                    : "btns"
                }
              >
                h5
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 6 }).run()
                }
                className={
                  editor.isActive("heading", { level: 6 })
                    ? "is-active"
                    : "btns"
                }
              >
                h6
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Arial" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Arial").run()
                }
              >
                Arial
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Helvetica" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Helvetica").run()
                }
              >
                Helvetica
              </button>
              <button
                className={
                  editor.isActive("textStyle", {
                    fontFamily: "Times New Roman",
                  })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Times New Roman").run()
                }
              >
                Times New Roman
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Georgia" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Georgia").run()
                }
              >
                Georgia
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Courier New" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Courier New").run()
                }
              >
                Courier New
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Comic Sans" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Comic Sans").run()
                }
              >
                Comic Sans
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "monospace" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("monospace").run()
                }
              >
                monospace
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "cursive" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("cursive").run()
                }
              >
                cursive
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Verdana" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Verdana").run()
                }
              >
                Verdana
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Arial Black" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Arial Black").run()
                }
              >
                Arial Black
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Geneva" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Geneva").run()
                }
              >
                Geneva
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Tahoma" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Tahoma").run()
                }
              >
                Tahoma
              </button>
              <button
                className={
                  editor.isActive("textStyle", { fontFamily: "Trebuchet MS" })
                    ? "is-active"
                    : "btns"
                }
                onClick={() =>
                  editor.chain().focus().setFontFamily("Trebuchet MS").run()
                }
              >
                Trebuchet MS
              </button>
            </FloatingMenu>
          </div>
        </IconContext.Provider>
      </div>
      <div className="editor_container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
