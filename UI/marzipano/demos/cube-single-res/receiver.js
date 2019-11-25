let connectionIdx = 0;
let messageIdx = 0;

function addConnection(connection) {
  connection.connectionId = ++connectionIdx;
  addMessage('New connection #' + connectionIdx);

  connection.addEventListener('message', function(event) {
    messageIdx++;
    const data = JSON.parse(event.data);
    const logString = 'Message ' + messageIdx + ' from connection #' +
        connection.connectionId + ': ' + data.message;
    addMessage(logString, data.lang);
    bindMain(data.message);
    connection.send('Received message ' + messageIdx);
  });

  connection.addEventListener('close', function(event) {
    addMessage('Connection #' + connection.connectionId + ' closed, reason = ' +
        event.reason + ', message = ' + event.message);
  });
};

function addMessage(content, language) {
  const listItem = document.createElement("li");
  if (language) {
    listItem.lang = language;
  }
  listItem.textContent = content;
  document.querySelector("#message-list").appendChild(listItem);
};

function bindMain(message)
{
    var mainContent = "<img src='" + message + "'>";
    document.querySelector('#main').innerHTML = mainContent;
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('Navigator: ' + JSON.stringify(navigator));
  console.log('Presentation: ' + JSON.stringify(navigator.presentation));
  if (navigator.presentation.receiver) {
    navigator.presentation.receiver.connectionList.then(list => {
      list.connections.map(connection => addConnection(connection));
      list.addEventListener('connectionavailable', function(event) {
        addConnection(event.connection);
      });
    });
  }
});