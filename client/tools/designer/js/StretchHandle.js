/**
 * Stretch handles can change the width/height and x/y of the scraps.
 */
Designer.StretchHandle = function () {
}

// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
var toProperCase = function (string) {
  return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
}

/**
 * @param {string}
 * @param {string}
 * @param {string}
 */
Designer.StretchHandle.create = function (scrap, row, column, fixed) {
  
  var element = scrap.element()
  var position = (element.css('position') == 'fixed' ? 'fixed' : 'absolute')
  
  var cursor = (row == "top" ? "n" : (row == "bottom" ? 's' : '')) +
               (column == "left" ? "w" : (column == "right" ? 'e' : ''))
  var div = $('<div></div>')
  div.attr('value', scrap.getPath())
  div.addClass('DesignerHandle')
  div.addClass('DesignerStretchHandle')
  div.addClass('DesignerStretchHandle' + scrap.id)
  div.addClass(scrap.id + 'Handle')
  div.attr('id', 'DesignerStretchHandle' + toProperCase(row) + toProperCase(column) + scrap.id)
  div.css({
    "cursor" : cursor + "-resize",
    "position" : position,
    "width" : '8px',
    "height" : '8px',
    'border' : '1px solid rgba(0, 0, 0, .5)',
    'background-color' : 'rgba(255, 255, 255, 0.5)',
    "z-index" : "50"
  })
  div.data("row", row)
  div.data("column", column)
  if (fixed)
    div.data("fixed", true)
  element.parent().append(div)
  div.on("mousedown", Designer.StretchHandle.mousedown)
  div.on("slide", Designer.StretchHandle.slide)
  div.on("slidestart", Designer.StretchHandle.slidestart)
  div.on("slideend", Designer.StretchHandle.slideend)
  div.on("tap", Designer.StretchHandle.tap)
  div.on("update", Designer.StretchHandle.update)
  div.on("dblclick", Designer.StretchHandle.dblclick)
  div.trigger("update")
}

/**
 * We cache the start dimensions
 */
Designer.StretchHandle.dimensions = {}

/**
 * If small scrap is on top of (higher z-index) a bigger scrap, selects small scrap
 */
Designer.StretchHandle.mousedown = function () {
  Designer.StretchHandle.dimensions = $(this).owner().dimensions()
  var scrap = $(this).owner().scrap()
  var width = scrap.get('style width')
  if (width) {
    Designer.StretchHandle.originalWidth = parseFloat(width)
    Designer.StretchHandle.isWidthPercentage = width.toString().match(/\%/) 
  }
  var height = height
  if (height) {
    Designer.StretchHandle.originalHeight = parseFloat(height)
    Designer.StretchHandle.isHeightPercentage = height.toString().match(/\%/) 
  }
  Designer.grid.create()
}

/**
 * Changes the width/height/top/left of the active div.
 *
 * @return false. Don't propagate.
 * todo: rotate vector if fixed.
 */
Designer.StretchHandle.slide = function () {

  var owner = $(this).owner(),
      row = $(this).data().row,
      column = $(this).data().column,
      fixed = $(this).data().fixed,
      x0, // x origin
      y0  // y origin
  
  if (column === 'left')
    x0 = Designer.StretchHandle.dimensions.right
  else if (column === 'right')
    x0 = Designer.StretchHandle.dimensions.left
  else
    x0 = Designer.StretchHandle.dimensions.center
  
  if (row === 'top')
    y0 = Designer.StretchHandle.dimensions.bottom
  else if (row === 'bottom')
    y0 = Designer.StretchHandle.dimensions.top
  else
    y0 = Designer.StretchHandle.dimensions.middle
  
  var x1 = Designer.Mouse.move.pageX - $(this).parent().offset().left // + scroll left
  var y1 = Designer.Mouse.move.pageY - $(this).parent().offset().top// Designer.stage.scrollTop()// + scroll top
//  console.log(x1)
  
  // todo: fix bug where offset changes
  
  var length = Designer.StretchHandle.getLength(x0, y0, x1, y1,
    // Dont snap Y if we are only changing X, and vice versa
    column != 'center', row != 'middle')
  
  // Get the scrap we are stretching
  var scrap = owner.scrap()
  
  /*----- Scrap changes ----*/
  
  var newWidth = scrap.get('style width') || owner.css('width')
  var newHeight = scrap.get('style height') || owner.css('height')
  
  if (column !== 'center') {
    // If the length is positive, keep the origin as the top/left value
    scrap.set('style left', (length.x >= 0 ? x0 : length.x + x0) + 'px')
    // Compute and extraWidth (padding, border width, etc)
    var extraWidth = owner.outerWidth() - owner.width()
    // Set the width & height to the abs value of the length
    newWidth = Math.abs(length.x) - extraWidth
    // If % convert back
    if (Designer.StretchHandle.isWidthPercentage)
      newWidth = Math.round(100*newWidth/owner.parent().width()) + '%'
    else
      newWidth += "px"
    scrap.set('style width', newWidth)
  }
  
  // If fixed, we take the change from the left to right for now.
  if (fixed) {
    var change = parseFloat(scrap.get('style width')) / Designer.StretchHandle.originalWidth
    scrap.set('style height', Math.round(Designer.StretchHandle.originalHeight * change) + 'px')
  }
  
  
  else if (row != 'middle') {
    if (length.y >= 0) {
      scrap.set('style top', y0 + 'px')
    } else {
      scrap.set('style top', length.y + y0 +  'px')
    }
    var extraHeight = owner.outerHeight(true) - owner.height()
    newHeight = Math.abs(length.y) - extraHeight
    // If % convert back
    var parentHeight = owner.parent().height() || $(window).height()
    if (Designer.StretchHandle.isHeightPercentage)
      newHeight = Math.round(100*newHeight/parentHeight) + '%'
    else
      newHeight += "px"
    scrap.set('style height', newHeight)
  }
  
  /*----- Dom changes ----*/
  
  // Apply the style to the dom element
  owner.css(scrap.values.style.values)
  
  // Draw the dimensions.
  var position = 'W ' + newWidth + '<br> H ' + newHeight
  $('#DesignerDimensions').css({
    left : 10 + owner.offset().left + owner.outerWidth(),
    top : -10 + owner.offset().top + Math.round(owner.outerHeight(true)/2)
    }).html(position)
  
  // Reposition stretch handles
  $('.DesignerStretchHandle' + scrap.id).trigger('update')
  return false
  
}

/**
 * Hide all other handles on this scrap on slidestart.
 */
Designer.StretchHandle.slidestart = function (event) {
  var owner = $(this).owner()
  var scrap = owner.scrap()
  $('.' + scrap.id + 'Handle').not('.DesignerStretchHandle' + scrap.id).hide()
  

  var position = 'W ' + parseFloat(owner.css('width')) + '<br> H ' + parseFloat(owner.css('height'))
  $('#DesignerDimensions').css({
    left : 10 + owner.offset().left + owner.outerWidth(),
    top : -10 + owner.offset().top + Math.round(owner.outerHeight(true)/2)
    }).html(position).show()
  
  return false
}


Designer.StretchHandle.dblclick = function () {
  
  var owner = $(this).owner(),
      row = $(this).data().row,
      column = $(this).data().column
  
  // Get the scrap we are stretching
  var scrap = owner.scrap()
  
  if (column === 'right')
    scrap.set('style width', '100%')
  if (column === 'left')
    scrap.set('style left', '0')
  if (row === 'top')
    scrap.set('style top', '0')
  if (row === 'bottom')
    scrap.set('style height', '100%')

  // Apply the style to the dom element
  owner.css(scrap.values.style.values)
  $('.' + scrap.id + 'Handle').trigger('update').show()
  Designer.stage.commit()
}

/**
 * Show all handles that were hidden. Update the grid and commit the change.
 */
Designer.StretchHandle.slideend = function () {
  var element = $(this).owner()
  var scrap = element.scrap()
  $('.' + scrap.id + 'Handle').trigger('update').show()
  Designer.grid.removeSnaplines()
  $('#DesignerDimensions').hide()
  Designer.stage.commit()
}

/**
 * We simply return the length from the origin on a 2D grid. If X is initial handle position, then
 * O is origin, and H is the current mouse position. We return the length of OH
 * which is determined by where H is, with any snapped grid lin
 *
 *      O--------X-----H
 *
 * @param {number} The top or left position of the handle OPPOSITE the one the maker grabbed
 * @param {string} Whether this is a vertical or horizontal change.
 * @returns {object} Such as length.x, length.y
 */
Designer.StretchHandle.getLength = function (x0, y0, x1, y1, xSnap, ySnap) {
  var length = { x : x1 - x0, y: y1 - y0}
  
  var gridChange = Designer.grid.getDelta([
     {x : x1, y : y1}
  ])
  
  if (xSnap)
    length.x += gridChange.x
  if (ySnap)
    length.y += gridChange.y
  return length
}

/**
 * Don't propagate tap events on these sliders.
 */
Designer.StretchHandle.tap = function () {
  return false
}

/**
 * Reposition the sliders.
 */
Designer.StretchHandle.update = function () {
  var element = $(this).owner()
  var left,
      _top,
      row = $(this).data().row,
      column = $(this).data().column
  
  switch (row) {
    case "top":
      _top = element.position().top - 4
    break;
    case "middle":
      _top = element.position().top + Math.round(element.outerHeight(true)/2) - 4
    break;
    case "bottom":
      _top = element.position().top + element.outerHeight(true) - 4
    break;
  }
  switch (column) {
    case "left":
      left = element.position().left - 4
    break;
    case "center":
      left = element.position().left + Math.round(element.outerWidth()/2) - 4
    break;
    case "right":
      left = element.position().left + element.outerWidth() - 4
    break;
  }

  $(this).css({
    left : left,
    'top' : _top
  })
}
