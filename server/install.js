var fs = require('fs')

function Install (app) {

  console.log('Installing necessary files and objects...')
  
  // Main project path
  // Create the project folder. All maker data and apps go here.
  // It is a good idea to make this folder a git repo to version all
  // a team project data.
  if (!fs.existsSync(app.paths.project))
    fs.mkdirSync(app.paths.project)

  if (!fs.existsSync(app.paths.nudgepad))
    fs.mkdirSync(app.paths.nudgepad)

  // Create team folder
  if (!fs.existsSync(app.paths.team))
    fs.mkdirSync(app.paths.team)

  // Create pages folder
  if (!fs.existsSync(app.paths.pages))
    fs.mkdirSync(app.paths.pages)
  

}

module.exports = Install
