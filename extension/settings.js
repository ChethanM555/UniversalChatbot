document.addEventListener("DOMContentLoaded", () => {
  var keyForm = document.getElementById("key-form");
  keyForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // prevent default form submission
    var key = document.getElementById("key").value;
    await setupAPIKey(key);
  });
});

async function setupAPIKey(key) {
  var url = "http://localhost:3000/setupAPIKey";

  fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    //make sure to serialize your JSON body
    body: JSON.stringify({
      APIKey: key,
    }),
  })
    .then((Result) => Result.json())
    .then((Result) => {
      console.log(Result.message);
    })
    .catch((errorMsg) => {
      console.log(errorMsg);
    });
}
