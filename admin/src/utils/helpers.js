// ── Format slot date key → readable date ──────────────────────────────────────
// Input:  "15_6_2025"
// Output: "15 Jun 2025"
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const formatSlotDate = (slotDate) => {
  if (!slotDate) return '—'
  const [d, m, y] = slotDate.split('_')
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`
}

// ── Get initials from full name ───────────────────────────────────────────────
export const getInitials = (name = '') =>
  name.split(' ')
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
