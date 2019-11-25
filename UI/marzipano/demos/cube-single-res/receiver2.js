let connectionIdx = 0;
let messageIdx = 0;

function addConnection(connection) {
  connection.connectionId = ++connectionIdx;
  addMessage('New connection #' + connectionIdx);

  connection.addEventListener('message', function(event) {
    messageIdx++;
    const data = JSON.parse(event.data);
    
    if (data.type == "presentationSingle")
    {
      const logString = 'Message ' + messageIdx + ' from connection #' + connection.connectionId + ': ' + data.message;
      addMessage(logString);
      bindMain(data.message);
      connection.send('Received message ' + messageIdx);
      gridster.remove_all_widgets();
      $('.gridster ul').css('height', '0px');
    } else if (data.type == "presentationRange")
    {
      const logString = 'Message ' + messageIdx + ' from connection #' + connection.connectionId + '> start: ' + data.start + ' - end: ' + data.end;
      addMessage(logString);
      bindRange(data.start, data.end);
      connection.send('Received message ' + messageIdx);
    }
  });

  connection.addEventListener('close', function(event) {
    addMessage('Connection #' + connection.connectionId + ' closed, reason = ' +
        event.reason + ', message = ' + event.message);
  });
};

function addMessage(content) {
  const listItem = document.createElement("li");
  listItem.textContent = content;
  document.querySelector("#message-list").appendChild(listItem);
};

function bindMain(message)
{
    var mainContent = "<img src='" + message + "'>";
    document.querySelector('#main').innerHTML = mainContent;
}

gridster = $('.gridster > ul').gridster({
  widget_base_dimensions: ['auto', 240],
  autogenerate_stylesheet: true,
  min_cols: 1, 
  max_cols: 4,
  widget_margins: [5, 5],
  resize: {
      enabled: false,
      min_size: [ 1, 1],
      max_size: [ 4, 4],
      stop: function (e, ui, $widget) {
          console.log('resize in');
          console.log(e);
          console.log(ui);
          console.log($widget);
          var elemHtml = $widget[0].innerHTML;
          var start = elemHtml.indexOf('img id="');
          var rest = elemHtml.substr(start + 8, elemHtml.length - (start + 8));
          var end = rest.indexOf('" ');
          var id = elemHtml.substr(start + 8, end);
          var link = $('#' + id).attr('link');
          $('#' + id).attr('src', link);
      }
  }
}).data('gridster');

var widgets = new Array();
function getCCTVNumber(i)
{
  if (i > 0 & i < 10)
    return "00" + i;
  else if (i >= 10 & i < 100)
    return "0" + i;
  else if (i >= 100 & i < 1000)
    return i;
  else
    return "";
}
function getImage(i)
{
  var index = 0;
  var uri = "http://pub.cloudapp.net/CCTVS/";
  var cctvNumber = getCCTVNumber(i);
  return uri + cctvNumber;
}

function pushWidget(type, imgUri) 
{
  widgets.push({ width: 1, height: 1, type: type, uri: imgUri });
}

function retrieveImg(start, end)
{
  widgets = new Array();
  for(var i = start; i <= end; i++)
  {
    var imgUri = getImage(i);
    pushWidget('img', imgUri);
  }
}
function gridContent(i, widget)
{
  var content = '';
  if (widget.type == 'img')
  {
    content = `<li>
    <div style="width: 100%; height: 100%;">
        <img id="grid-` + i + `" src="` + widget.uri + `" link="` + widget.uri + `" style="width: 100%; height: 100%;">
        ` + addAdditionalInterface(i) + `
    </div>
</li>`
  } else {
    content = `<li>
    <div style="width: 100%; height: 100%;">
        <video style="width: 100%; height: 100%;" controls autoplay muted>
            <source src="` + widget.uri + `" type="video/mp4">
        </video>
        ` + addAdditionalInterface(i) + `
    </div>
</li>`
  }

  return content;
}
function addAdditionalInterface(i)
{
    return `
  <a prop="` + getCCTVNumber(i) + `" class="deleteWidget">x</a>
  <a prop="` + getCCTVNumber(i) + `" class="sizeplus">+</a>
  <a prop="` + getCCTVNumber(i) + `" class="sizeminus">-</a>`;
}

function loadGrid()
{
    gridster.remove_all_widgets();
    $.each(widgets, function(i, widget) {
        var widgetIndex = widget.uri.substr(widget.uri.length - 3, 3);
        
        var content = [gridContent(parseInt(widgetIndex), widget), widget.width, widget.height];
        gridster.add_widget.apply(gridster, content);
    });
}
function bindRange(start, end)
{
  console.log('click range start: ' + start + ' end: ' + end);
  retrieveImg(start, end);
  loadGrid();
  applyWheelZoom();
}

function applyWheelZoom()
{
  wheelzoom(document.querySelectorAll("img"), { zoom: 0.05 });
}

function propCut(target, key)
{
    var start = target.indexOf(key);
    var startIndex = start + (key.length + 1);
    var endIndex = target.length - (key.length + 1);
    var cut = target.substr(startIndex, endIndex);
    var final = cut.substr(0, cut.indexOf('"'));
    return final;
}

$('body').on('click', 'a.sizeplus', function (e) {
  console.log('click size plus');
  var target = e.target.outerHTML;
  var targetproperty = propCut(target, 'prop=');

  var reload = false;
  $.each(widgets, function (i, widget) {
      var found = widget.uri.indexOf(targetproperty);
      if (found >= 0)
      {
          if (widget.width < 4)
          {
              reload = true;
              widget.width = widget.width * 2;
              widget.height = widget.height * 2;
          }
      }
  })
  if (reload) {
      loadGrid();
      applyWheelZoom();
  }
});

$('body').on('click', 'a.sizeminus', function (e) {
  console.log('click size minus');
  var target = e.target.outerHTML;
  var targetproperty = propCut(target, 'prop=');

  var reload = false;
  $.each(widgets, function(i, widget) {
      var found = widget.uri.indexOf(targetproperty);
      if (found >= 0)
      {
          if (widget.width > 1)
          {
              reload = true;
              widget.width = widget.width / 2;
              widget.height = widget.height / 2;
          }
      }
  })
  if (reload) {
      loadGrid();
      applyWheelZoom();
  }
});

$('body').on('click', 'a.deleteWidget', function(e) {
  console.log('delete widget in');
  var target = e.target.outerHTML;
  var targetproperty = propCut(target, 'prop=');
  console.log(targetproperty);

  var foundIndex;
  $.each(widgets, function (i, widget) {
      var found = widget.uri.indexOf(targetproperty);
      if (found >= 0)
          foundIndex = i;
  });

  if (foundIndex != undefined)
  {
      widgets.splice(foundIndex, 1);
  }
  loadGrid();
  applyWheelZoom();
})



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