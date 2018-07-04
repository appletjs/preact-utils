export function parseSlots(props) {
  const slots = {};

  props.children.forEach(function (child, i) {
    if (child == null) return;
    const name = (child.attributes || {}).slot;
    if (!name) return;
    props.children[i] = undefined;
    (slots[name] || (slots[name] = [])).push(child);
  });

  return slots;
}
