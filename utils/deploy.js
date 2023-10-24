const fs = require('fs');
const child_process = require('child_process')


fs.copyFileSync("./public/manifest.json", "./public/manifest.json.local")
let manifest = fs.readFileSync("./public/manifest.json")

let json = JSON.parse(manifest)
json.name = "Mapper"
json.start_url = "https://chrisbaldys.com/mapper/index.html"

fs.writeFileSync("./public/manifest.json", JSON.stringify(json))
child_process.execSync("rsync -avh ./public/* web-land:/var/www/chrisbaldys.com/public_html/mapper/. --delete")

fs.copyFileSync("./public/manifest.json.local", "./public/manifest.json")
fs.rmSync("./public/manifest.json.local")




