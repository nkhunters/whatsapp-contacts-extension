"use strict";

// start navigation when #startNavigation button is clicked
startNavigation.onclick = async function (element) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
};

function setPageBackgroundColor() {
  const sideDiv = document.getElementById("side");
  const contentDiv = document.getElementById("pane-side");

  const contacts = [];

  var scroll = setInterval(() => {
    const rawData = document.getElementById("pane-side").innerText;

    const regex =
      /^(?=(?:[+ -]*[0-9][+ -]*){11,12}$)\+(?:[0-9]+[ -]?)+[0-9]$/gm;
    let m;

    while ((m = regex.exec(rawData)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        const number = match.replaceAll(/\s/g, "");
        contacts.push(number);
      });
    }

    document.querySelector("#pane-side").scrollBy({
      top: 600,
      left: 0,
      behavior: "smooth",
    });
    if (
      contentDiv.scrollHeight - contentDiv.scrollTop ===
      contentDiv.clientHeight
    ) {
      clearInterval(scroll);
      contentDiv.scrollTo(0, 0);

      const numbers = [];
      const numbersTemp = [...new Set(contacts)];
      numbersTemp.map((num) => numbers.push({ number: num }));

      const myContent = document.createElement("div");
      myContent.innerHTML = `<div style="background: #df0e16; color: white; padding: 20px; display: flex;
  justify-content: space-between; align-items: center;"><div>Found ${numbers.length} new contacts</div> <button 
  style="
  background-color: #fff;
  border: none;
  color: white;
  padding: 10px 20px 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  color: #df0e16;
  " id='save'>Save</button>`;
      sideDiv.insertBefore(myContent, contentDiv);

      document.getElementById("save").onclick = function saveContacts() {
        fetch("http://api.earneasy24.com/api/saveContacts", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ numbers: numbers }),
        })
          .then((res) => res.json())
          .then((res) => {
            alert("Contacts saved");
            sideDiv.removeChild(myContent);
          })
          .catch((err) => {
            alert(err);
          });
      };
    }
  }, 500);
}
