const text = document.getElementById("text")
const newButton = document.getElementById("newButton")
const newButton2 = document.getElementById("newButton2")
const massage = document.getElementById("massage")
function asd() {
  fetch("http://localhost:3000/docs")
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      text.innerHTML = JSON.stringify(data)
    })
}
function asd2() {
  fetch("http://localhost:3000/docs", {
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
