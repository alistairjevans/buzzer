"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/buzzerHub").build();

// Load the audio.
var audioElement = document.getElementById("buzzAudio");

var recentBuzzList = [];
var lastBuzz = Date.now();

connection.on("UserBuzz", function (user, dateTime) {

    var jsDateTime = new Date(dateTime);

    if (((Date.now() - lastBuzz) / 1000) > 5)
    {
        // After 10 seconds of no activity, empty the buzz list.
        recentBuzzList = [];
    }

    lastBuzz = Date.now();

    recentBuzzList.push({ user, jsDateTime });

    var myUser = document.getElementById("userInput").value;

    if (user !== myUser) {
        // Buzz arrived, play the buzzer audio.
        audioElement.currentTime = 0.5;
        audioElement.play();
    }

    // Update the display.
    // Sort the items by the first.
    var sortedSet = sortBuzzes(recentBuzzList);

    displaySet(sortedSet);
}); 

function displaySet(buzzSet)
{
    var buzzContainer = document.getElementById("buzzes");

    buzzContainer.innerHTML = '';

    var seenUsers = [];
    var winningTimeStamp = 0;

    for (var idx = 0; idx < buzzSet.length; idx++) {

        var item = buzzSet[idx];

        if (seenUsers.indexOf(item.user) !== -1) {
            continue;
        }

        var buzzElement = document.createElement("div");
        buzzElement.className = "buzz-entry my-1 container";

        var rowElement = document.createElement("div");
        rowElement.className = "row p-1";

        var userNameEl = document.createElement("div");
        userNameEl.className = "col-6 user";
        userNameEl.textContent = item.user;

        rowElement.appendChild(userNameEl);

        var detailEl = document.createElement("div");
        detailEl.className = "col-6 extra";

        if (idx === 0)
        {
            buzzElement.classList.add("winner");
            winningTimeStamp = item.jsDateTime.getTime();

            detailEl.textContent = "🎉";
        }
        else
        {
            var diff = (item.jsDateTime.getTime() - winningTimeStamp) / 1000;

            detailEl.textContent = `+${diff} secs`;
        }

        rowElement.appendChild(detailEl);

        buzzElement.appendChild(rowElement);

        seenUsers.push(item.user);

        buzzContainer.appendChild(buzzElement);
    }
}

function sortBuzzes(buzzList)
{
    var copy = buzzList.concat();

    return copy.sort((left, right) => {
        var leftStamp = left.jsDateTime.getTime();
        var rightStamp = right.jsDateTime.getTime();
        if (leftStamp < rightStamp) {
            return -1;
        }
        if (rightStamp > leftStamp) {
            return 1;
        }
        return 0;
    });
}

connection.start().then(function () {

    function buzzHandler() {
        var user = document.getElementById("userInput").value;

        if (user) {
            connection.invoke("Buzz", user).catch(function (err) {
                return console.error(err.toString());
            });
            // Buzz arrived, play the buzzer audio.
            audioElement.currentTime = 0.5;
            audioElement.play();
        }
        event.preventDefault();
    }

    var buzzer = document.getElementById("buzzer");
    buzzer.addEventListener("mousedown", buzzHandler);
    buzzer.addEventListener("touchstart", () => {
        buzzer.classList.add("touched");
        buzzHandler();
    });
    buzzer.addEventListener("touchend", () => {
        buzzer.classList.remove("touched");
    })

}).catch(function (err) {
    return console.error(err.toString());
}); 
