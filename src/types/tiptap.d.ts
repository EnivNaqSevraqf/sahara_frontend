import { Editor } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bold: {
      toggleBold: () => ReturnType;
    };
    italic: {
      toggleItalic: () => ReturnType;
    };
    bulletList: {
      toggleBulletList: () => ReturnType;
    };
    orderedList: {
      toggleOrderedList: () => ReturnType;
    };
    blockquote: {
      toggleBlockquote: () => ReturnType;
    };
    link: {
      setLink: (attributes: { 
        href: string;
        target?: string;
        rel?: string;
      }) => ReturnType;
      unsetLink: () => ReturnType;
    };
    undo: {
      undo: () => ReturnType;
    };
    redo: {
      redo: () => ReturnType;
    };
  }
}

declare module '@tiptap/starter-kit' {
  import { Extension } from '@tiptap/core';
  const StarterKit: Extension;
  export default StarterKit;
}

declare module '@tiptap/extension-link' {
  import { Extension } from '@tiptap/core';
  const Link: Extension;
  export default Link;
} 