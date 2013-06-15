/**
 * Launches the default block editor.
 *
 * @param {string} Scrap id
 * @return {Scrap} this
 */
Scrap.prototype.onedit = '' // String, name of app to open.
Scrap.prototype.edit = function (selectAll) {
  
  if (this.values.onedit && window[this.values.onedit])
    window[this.values.onedit].open()
  
  // Default block editor
  else
    Design.contentEditor.focus(this.selector(), selectAll)

  return this
}

Scrap.prototype.element = function () {
  return $(this.selector())
}

Scrap.prototype.getPath = function () {
  return this.path.replace(/ /g, ' scraps ')
}

/**
 * @return {bool}
 */
Scrap.prototype.isContentEditable = function () {
  if (this.values.content_format === 'nl2br' || this.values.content_format === 'markdown')
    return false
  if (this.values.content && this.values.content.match(/\{\{.*\}\}/))
    return false
  if (this.values.tag && this.values.tag.match(/^(textarea|input|password|label|button|list|ul|ol)$/))
    return false
  return true
}

/**
 * @param {number}
 * @param {number}
 * @return {Scrap} this
 */
Scrap.prototype.move = function (x, y) {
  
  // move can adjust multiple properties
  // Cases:
  // left 20%; left 20px; right 20px;
  var css = {}
  var style = this.get('style')
  if (!style) {
    this.set('style', new Space())
    style = this.get('style')
  }
  
  // Move right or left
  if (x) {
    // Move ->
    var left = style.get('left')
    if (typeof left !== 'undefined') {
      css.left = (x + parseFloat(left)) + 'px'
      style.set('left', css.left)
    }
    var right = style.get('right')
    if (typeof right !== 'undefined') {
      css.right = (-x + parseFloat(right)) + 'px'
      style.set('right', css.right)
    }
    if (typeof style.get('margin-left') !== 'undefined') {
      style.set('margin-left', (x + parseFloat(style.get('margin-left'))) + 'px')
      css['margin-left'] = style.get('margin-left')
    }
  }
  // Move up or down
  if (y) {
    if (typeof style.get('top') !== 'undefined') {
      style.set('top', (y + parseFloat(style.get('top'))) + 'px')
      css.top = style.get('top')
    }    
    if (typeof style.get('bottom') !== 'undefined') {
      style.set('bottom', (-y + parseFloat(style.get('bottom'))) + 'px')
      css.bottom = style.get('bottom')
    }
    if (typeof style.get('margin-top') !== 'undefined') {
      style.set('margin-top', (y + parseFloat(style.get('margin-top'))) + 'px')
      css['margin-top'] = style.get('margin-top')
    }
  }
  this.element().css(css)
  return this
}

Scrap.prototype.moveDown = function () {
  if (!this.values.style)
    this.set('style', new Space())
  
  if (this.get('style z-index') === undefined)
    this.set('style z-index', 0)
  else
    this.set('style z-index', parseFloat(this.get('style z-index')) - 1)
    
  $(this.selector()).css("z-index", this.get('style z-index'))
}

Scrap.prototype.moveUp = function () {
  if (!this.values.style)
    this.set('style', new Space())
  
  if (this.get('style z-index') === undefined)
    this.set('style z-index', 1)
  else
    this.set('style z-index', parseFloat(this.get('style z-index')) + 1)
    
  $(this.selector()).css("z-index", this.get('style z-index'))
}

Scrap.prototype.parentSelector = function () {
  return this.selector().replace(/\>[^\>]+$/, '') // chop last
}

/**
 * @return this
 */
Scrap.prototype.render = function (context, index) {
  // dont render invisibles
  if (this.values.tag && this.values.tag.match(/title|script|meta/))
    return this
  
  if (this.values.tag === 'head') {
    if (this.values.scraps) {
      this.values.scraps.each(function (key, value) {
        value.render(context)
      })
    }
    return this
  }
  
  var options = {draft : true}
  
  // Throw style tags into a div that we can easily empty
  if (this.values.tag && this.values.tag.match(/style|link/)) {
    this.setElementTag(context)
    this.setContent(context, options)
    $('#nudgepadStageHead').append(this.div.toHtml())
    return this
  }
  
  // Turn body tags into divs during the render stage
  if (this.values.tag && this.values.tag === 'body') {    
    this.setElementTag(context)
    this.setContent(context, options)
    this.setStyle(context)
//    this.div.addClass('scrap')
//    this.div.attr('path', this.getPath())
//    this.div.attr('selector', this.selector())
    this.div.tag = 'div'
    $('#nudgepadStageBody').append(this.div.toHtml())
    return this
  }
  
  // Remove the style, the html, and the script
  if (index)
    $(this.parentSelector()).insertAt(index, this.toHtml(context))
  else
    $(this.parentSelector()).append(this.toHtml(context))
  return this
}

Scrap.prototype.selector = function () {
  var selector = this.path.replace(/[^a-z0-9\-\.\_ ]/gi, '').replace(/ /g, '>#')
  if (!selector)
    return ''
  return '#nudgepadStageBody>#' + selector
}

/**
 * Returns the HTML for a scrap without CSS or Script.
 *
 * @param {object} Context to evaluate any variables in.
 * @return {string}
 */
Scrap.prototype.toHtml = function (context) {
  var options = {draft : true}
  this.setElementTag(context)
  this.setContent(context, options)
  this.setStyle(context)
  this.div.addClass('scrap')
  this.div.attr('path', this.getPath())
//  this.div.attr('page', Design.stage.activePage)
  this.div.attr('selector', this.selector())
  return this.div.toHtml()
}

Scrap.prototype.unlock = function () {
  
  if (!this.values.locked)
    return true
  
  this.delete('locked')
  $(this.selector()).removeClass('lockedScrap')
  return true
  
}

/** Event Handlers **/


/**
 * Prevent leaving of page when you click on blocks that are links
 * or links inside blocks
 *
 * @param {event}
 * @return false
 */
Scrap.disableLinks =  function (event) {
  event.preventDefault()
  return false
}


/**
 * Pop Advanced Handle on Hold
 *
 * @param {event}
 * @return false
 */
Scrap.selectOnTap =  function (event) {
  // blur any focused elements
  if (!$(this).is(':focus'))
    $(':focus').blur()


  // Hold meta key to nest something
  if (Mouse.down && Mouse.down.metaKey) {
    if (!$(this).hasClass('selection') && $('.selection').length) {
      Design.stage.selection.nest($(this).attr('path'))
      return false
    }
  }
  

  // If shift key is not down, clear selection first
  if (!Mouse.down || !Mouse.down.shiftKey)
    Design.stage.selection.clear()

  $(this).selectMe()

  // return false to not trigger default events
  return false
}

Scrap.unlock = function () {
  
  var scrap = $(this).scrap()
  
  // Unlock block on hold
  if (scrap.get('locked')) {
    scrap.unlock()
    Design.stage.commit()
  }
  
  $(this).selectMe()
  return false
}


nudgepad.on('main', function () {
  $(document).on('click', 'a.scrap, .scrap a, .scrap div', Scrap.disableLinks)
  $('#nudgepadStage').on("tap", ".scrap", Scrap.selectOnTap)
  
  $('body').on("hold", ".scrap", Scrap.unlock)
  
  // When editing input blocks, prevent them from taking focus
  $(document).on('mousedown click','input.scrap,textarea.scrap', function (){
    return false
  })
  $(document).on('focus', 'input.scrap,textarea.scrap', function (e) {$(this).blur()})
  
})



