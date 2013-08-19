Designer.menu.autopublish = false

Designer.menu.blank = function () {

  var pageName = prompt('Name your page', Designer.menu.nextName())
  if (!pageName)
    return null
  Designer.menu.create(pageName, $('#DesignerBlankPage').text())
}


/**
 * Delete a page's history
 */
Designer.menu.clearTimelinePrompt = function () {
  
  if (!confirm("Are you sure you want to erase the history of this page?"))
    return false

  var page = Designer.stage.activePage
  Designer.stage.close()
  Project.delete('timelines ' + page)
  Designer.stage.open(page)
}


/**
 * @param {string} Name of the file
 * @param {string} A template to initialize the page with.
 * @return {string} The name of the created page
 */
Designer.menu.create = function (name, template) {
  
  name = (name ? Permalink(name) : Designer.menu.nextName())
  
  // page already exists
  if (Project.get('pages ' + name))
    return Alerts.error('A page named ' + name + ' already exists.')
  
  var page = new Space(template)
  var timeline = new Space()
  // If passed a template, make that the first "undo" step
  if (template) {
    var commit = new Space()
    commit.set('author', Cookie.email)
    commit.set('values', new Space(template))
    timeline.set(new Date().getTime(), commit)
  }
  
  Project.create('pages ' + name, page)
  Project.create('timelines ' + name, timeline)
  
  Designer.stage.open(name)
  mixpanel.track("I created a new webpage")
  return name
}

/**
 * Deletes a page.
 *
 * @param {string} Name of the file
 * @return {string} todo: why return a string?
 */
Designer.menu.delete = function (name) {
  name = name || Designer.stage.activePage
  // If its the currently open page, open the previous page first
  if (Designer.stage.activePage === name)
    Designer.stage.back()

  Project.delete('pages ' + name)
  Project.delete('timelines ' + name)
  
  Alerts.success('Deleted ' + name, 1000)
  mixpanel.track('I deleted a page')
  return ''
}

/**
 * Duplicates the current open page.
 *
 * @param {string} name of page to duplicate. Defaults to current page.
 * @param {string} name of new page. Defaults to source + 1
 * @param {bool} We need to skip prompting for unit testing.
 * @return {string} Name of new page
 */
Designer.menu.duplicate = function (source, destination, skipPrompt) {
  
  source = source || Designer.stage.activePage
  
  destination = Designer.menu.nextName(destination || source)
  
  if (!skipPrompt) {
    destination = prompt('Name your new page', destination)
    if (!destination)
      return false
  }
  
  if (!Project.get('pages').get(source))
    return Alerts.error('Page ' + source + ' not found')
  
  mixpanel.track('I duplicated a page')
  
  // If we are duplicating a page thats not open, easy peasy
  if (source !== Designer.stage.activePage)
    return Designer.menu.create(destination, Project.get('pages').get(source))
  
  return Designer.menu.create(destination, Designer.page.toString())
}

/**
 * Get the next available name. For example untitled_1 or untitled_2
 *
 * @param {string} Optional prefix to add to the name. Defaults to untitled_
 * @return {string} The new name
 */
Designer.menu.nextName = function (prefix) {
  var prefix = prefix || 'untitled'
  if (!Project.get('pages ' + prefix))
    return prefix
  for (var i = 1; i < 1000; i++) {
    if (!Project.get('pages ' + prefix + i))
      return prefix + i
  }
}

Designer.menu.prettyPrint = true

Designer.menu.publish = function (url, pageString, callback) {
  var html = new Page(pageString).toHtml(function () {
    // File draft scrap
    if (this.get('draft') === 'true')
      return ''
    return this.div.toHtml()
    
  })
  
  if (Designer.menu.prettyPrint)
    html = html_beautify(html)
  
  fs.writeFile(url, html, callback)
}

/**
 * Renames the currently open page.
 *
 * @param {string} New name
 * @return {string} todo: why return a string?
 */
Designer.menu.rename = function (newName) {
  
  mixpanel.track('I renamed a page')
  
  newName = Permalink(newName)
  var oldName = Designer.stage.activePage
  
  if (!newName.length)
    return Alerts.error('Name cannot be blank')
  
  // page already exists
  if (Project.get('pages ' + newName))
    return Alerts.error('A page named ' + newName + ' already exists.')  

  Project.rename('pages ' + oldName, 'pages ' + newName)
  Project.rename('timelines ' + oldName, 'timelines ' + newName)
  
  Designer.stage.open(newName)
  
  mixpanel.track('I renamed a page')
  
  return ''

}

Designer.menu.renamePrompt = function () {
  var name = prompt('Enter a new name', Designer.stage.activePage)
  if (name)
    Designer.menu.rename(name)
}

/**
 * Launches the spotlight page picker
 */
Designer.menu.spotlight = function () {
  
  var name = prompt('Enter the name of the page to open...', '')
  if (name)
    Designer.stage.open(name)
}


