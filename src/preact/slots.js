export function parseSlots(children) {
  const slots = {};

  if (Array.isArray(children)) {
    children.forEach(function (child) {
      if (child == null) return;
      const attrs = child.attributes;
      const name = attrs && attrs.slot || 'default';
      (slots[name] || (slots[name] = [])).push(child);
    });
  }

  return slots;
}
