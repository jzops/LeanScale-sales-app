import { motion } from 'framer-motion';
import EditableTextArea from './EditableTextArea';
import { fadeUpItem } from '../../lib/animations';

/**
 * SowExecutiveSummary — Editable executive summary block.
 *
 * @param {string} summary - Current executive summary text
 * @param {function} onCommit - Called with new summary text
 * @param {boolean} readOnly - If true, no editing
 */
export default function SowExecutiveSummary({ summary, onCommit, readOnly = false }) {
  return (
    <motion.div
      variants={fadeUpItem}
      initial="hidden"
      animate="show"
      style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '0.75rem',
        padding: '1.5rem',
      }}
    >
      <h2 style={sectionHeadingStyle}>Executive Summary</h2>
      <EditableTextArea
        value={summary || ''}
        onCommit={onCommit}
        readOnly={readOnly}
        placeholder="No executive summary provided. Click to add one..."
        style={{
          fontSize: '0.875rem',
          color: '#4A5568',
          lineHeight: 1.7,
        }}
        minRows={3}
      />
    </motion.div>
  );
}

const sectionHeadingStyle = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#1a1a2e',
  marginBottom: '0.75rem',
  paddingBottom: '0.5rem',
  borderBottom: '2px solid #6C5CE7',
};
