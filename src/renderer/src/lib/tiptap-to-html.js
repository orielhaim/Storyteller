import { generateHTML } from '@tiptap/html';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';

const extensions = [
  StarterKit.configure({
    horizontalRule: false,
  }),
  HorizontalRule,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Image,
  Typography,
  Superscript,
  Subscript,
];

/**
 * Converts Tiptap JSON content to HTML
 * @param {Object} jsonContent - Tiptap JSON content
 * @returns {string} HTML string
 */
export function tiptapToHTML(jsonContent) {
  if (!jsonContent || !jsonContent.type) {
    return '';
  }

  try {
    return generateHTML(jsonContent, extensions);
  } catch (error) {
    console.error('Error converting Tiptap JSON to HTML:', error);
    return '';
  }
}
