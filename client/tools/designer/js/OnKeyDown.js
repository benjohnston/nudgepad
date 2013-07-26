/**
 * Start editing text when maker enters a character key.
 *
 * @param {object} keydown event.
 * @return {bool} Allow propagation unless we start editing.
 */
Designer.onkeydown = function (event) {
  // if maker is typing in a div or input already dont do anything
  if ($('input:focus, div:focus, textarea:focus, a:focus').length != 0)
    return true
  // allow control key combos to pass through
  if (event.ctrlKey || event.metaKey || event.shiftKey)
    return true
  // if a f key or something dont return.
  if ((event.keyCode < 48 && event.keyCode != 32) || event.keyCode > 90)
    return true
  // if no subject return
  if (!$('.DesignerSelection').length)
    return true
  // if an input or something return true
  if ($('.DesignerSelection').is("input") || $('.DesignerSelection').is("textarea"))
    return true
  // trigger edit event on the scrap
  $('.DesignerSelection').scrap().edit()
}
