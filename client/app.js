const text = document.getElementById("text")
const newButton = document.getElementById("newButton")
const newButton2 = document.getElementById("newButton2")
const massage = document.getElementById("massage")
function asd() {
  fetch("https://declabot.loca.lt//docs")
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      text.innerHTML = JSON.stringify(data)
    })
}
function asd2() {
  fetch("https://declabot.loca.lt//docs", {
    method: "POST",
    body: JSON.stringify({ type: "dsgfhs", content: "hhhhhhhhh" }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.text()
    })
    .then((data) => {
      massage.innerHTML = JSON.stringify(data)
    })
}

newButton.addEventListener("click", asd)
newButton2.addEventListener("click", asd2)
