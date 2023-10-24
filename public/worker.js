self.addEventListener("fetch", (event) => {
    console.log(event)
})

addEventListener("message", (msg) => {
    console.log(msg)
    if (msg === "init") {
        geoInit()
        console.log(navigator)
    }
})

function geoInit() {
    if ("geolocation" in navigator) {
        console.log("geo!!")
      } else {
        /* geolocation IS NOT available */
      }
}