import axios from "axios"

const url = "http://127.0.0.1:3000"

axios({
  url: url + "/declaration/101",
  method: "get",
})
  .then((res) => console.log("GET /declaration/101\n", res.data))
  .catch((err) => console.log("\nGET /declaration/101 Error\n", err.message))

axios({
  url: url + "/docs",
  method: "post",
  data: {
    type: "ale",
    content: "alba",
  },
}).then((res) => console.log("\nPOST /docs\n", res.data))

axios({
  url: url + "/docs",
  method: "get",
}).then((res) => console.log("\nGET /docs\n", res.data))

axios({
  url: url + "/docs/3",
  method: "delete",
})
  .then((res) => console.log("\nDELETE /docs/3\n", res.data))
  .catch((err) => console.log("\nDELETE /docs/3 Error\n", err.message))

axios({
  url: url + "/docs/2",
  method: "put",
  data: {
    type: "type",
  },
})
  .then((res) => console.log("\nPUT /docs/2\n", res.data))
  .catch((err) => console.log("\nPUT /docs/2 Error\n", err.message))

axios({
  url: url + "/docs",
  method: "get",
}).then((res) => console.log("\nGET /docs\n", res.data))
