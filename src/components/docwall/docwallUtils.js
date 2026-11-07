export function parseCommentDate(comment) {
  if (!comment) return new Date();
  if (comment.createdAt?.toDate && typeof comment.createdAt.toDate === 'function') {
    return comment.createdAt.toDate();
  }
  if (comment.createdAt?.seconds) {
    return new Date(comment.createdAt.seconds * 1000);
  }
  if (typeof comment.createdAt === 'string' || typeof comment.createdAt === 'number') {
    const d = new Date(comment.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (comment.timestamp) {
    const d = new Date(comment.timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function formatCommentTime(comment) {
  const d = parseCommentDate(comment);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}j lalu`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}h lalu`;

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function cleanCaptionText(text) {
  if (!text) return '';
  return text
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

