'use client';

import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { 
  Box,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import LinkOffIcon from '@mui/icons-material/LinkOff';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  minHeight?: string | number;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  label = 'Description',
  error = false,
  minHeight = '200px',
}) => {
  // Initialize the editor with all necessary extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'tiptap-bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'tiptap-ordered-list',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'tiptap-blockquote',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'tiptap-link',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        style: `min-height: ${minHeight}; padding: 10px;`,
      },
    },
  });

  // Update editor content when external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    let processedUrl = url;
    // If URL doesn't start with http:// or https:// or mailto:, prepend https://
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
      processedUrl = `https://${url}`;
    }

    // if the selection is empty, remove the link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update the link with the new URL and add target="_blank" and rel="noopener noreferrer"
    editor.chain().focus().extendMarkRange('link').setLink({
      href: processedUrl,
      target: '_blank',
      rel: 'noopener noreferrer'
    }).run();
  }, [editor]);

  const unsetLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  };

  if (!editor) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      {label && (
        <Typography 
          variant="body1" 
          component="label" 
          sx={{ 
            display: 'block', 
            mb: 1,
            color: error ? 'error.main' : 'text.primary',
            fontWeight: 500
          }}
        >
          {label} <Typography component="span" color="error">*</Typography>
        </Typography>
      )}
      
      <Paper 
        variant="outlined" 
        sx={{ 
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          '&:focus-within': {
            borderColor: error ? 'error.main' : 'primary.main',
            borderWidth: '2px',
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          p: 1, 
          backgroundColor: 'background.paper',
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
          gap: 0.5
        }}>
          <Tooltip title="Bold">
            <IconButton 
              size="small" 
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Italic">
            <IconButton 
              size="small" 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          
          <Tooltip title="Bullet List">
            <IconButton 
              size="small" 
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Numbered List">
            <IconButton 
              size="small" 
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Blockquote">
            <IconButton 
              size="small" 
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
            >
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          
          <Tooltip title="Add Link">
            <IconButton 
              size="small" 
              onClick={setLink}
              color={editor.isActive('link') ? 'primary' : 'default'}
            >
              <InsertLinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Remove Link">
            <IconButton 
              size="small" 
              onClick={unsetLink}
              disabled={!editor.isActive('link')}
            >
              <LinkOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          
          <Tooltip title="Undo">
            <IconButton 
              size="small" 
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Redo">
            <IconButton 
              size="small" 
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Divider />
        
        <Box
          sx={{
            '& .tiptap-editor-content': {
              fontFamily: 'inherit',
              fontSize: '1rem',
              color: 'text.primary',
              '&:focus': {
                outline: 'none',
              },
              '& p.is-editor-empty:first-child::before': {
                content: `"${placeholder}"`,
                float: 'left',
                color: 'text.disabled',
                pointerEvents: 'none',
                height: 0,
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'underline',
                cursor: 'pointer',
              },
              '& blockquote': {
                borderLeft: '3px solid',
                borderColor: 'divider',
                paddingLeft: 2,
                margin: '1em 0',
                color: 'text.secondary',
                fontStyle: 'italic',
              },
              '& ul': {
                listStyleType: 'disc',
                paddingLeft: 3,
                margin: '0.5em 0',
              },
              '& ol': {
                listStyleType: 'decimal',
                paddingLeft: 3,
                margin: '0.5em 0',
              },
              '& li': {
                margin: '0.2em 0',
              },
              '& li p': {
                margin: 0,
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
      
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          This field is required
        </Typography>
      )}
    </Box>
  );
};

export default TiptapEditor; 