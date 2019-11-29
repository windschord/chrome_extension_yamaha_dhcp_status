window.onload = loadData
document.getElementById('reloadBt').addEventListener('click', loadData)

function loadData(e) {
  document.getElementById('reloadBt').disabled = true;
  chrome.storage.sync.get(['prefix', 'baseUrl', 'username', 'password'], function (data) {
    prefix =  data.prefix ? data.prefix : 'http';
    baseUrl =  data.baseUrl ? data.baseUrl : '192.168.0.1';
    username =  data.username ? data.username : '';
    password =  data.password ? data.password : '';

    document.getElementById('targetUrl').textContent = `Get from ${prefix}://${username}:${password}@${baseUrl}`
    getSessionID(prefix,baseUrl,username, password)

  });
  document.getElementById('reloadBt').disabled = false;
}


function getSessionID(prefix,baseUrl,username, password) {
  var xhr = new XMLHttpRequest(),
    method = "GET",
    url = `${prefix}://${username}:${password}@${baseUrl}/detail/command.html`;

  xhr.open(method, url, true);

  // データが正常に送信された場合に行うことを定義します
  xhr.addEventListener('load', function (event) {
    var restxt = xhr.responseText
    ret = restxt.match(/.+name=\"HTTPD_SESSION_ID\" value="(.+)">/)
    if (ret.length != 2) {
      console.log('error to get session id')
    }
    console.log(ret[1])
    sendData(prefix,baseUrl,username, password, { "HTTPD_SESSION_ID": ret[1], "COMMAND": "show status dhcp" })
  });

  // エラーが発生した場合に行うことを定義します
  xhr.addEventListener('error', function (event) {
    alert('Oups! Something goes wrong with getting session id.');
    console.log(event)
  });

  xhr.send();
}


function sendData(prefix,baseUrl,username, password, data) {
  var XHR2 = new XMLHttpRequest();
  var urlEncodedData = "";
  var urlEncodedDataPairs = [];
  var name;

  for (name in data) {
    urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
  }
  urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

  // データが正常に送信された場合に行うことを定義します
  XHR2.addEventListener('load', function (event) {
    var restxt = XHR2.responseText

    data = []

    ipAddr = ''
    macAddr = ''
    hostName = ''
    remainingLease = ''

    restxt.split('\r\n').slice(2, -1).forEach(element => {
      ReIpAddr = element.match(/Leased address: (.+)/)
      ReEthAddr = element.match(/Client ethernet address: (.+)/)
      ReClientAddr = element.match(/\(type\) Client ID: (.+)/)
      ReHostName = element.match(/Host Name: (.+)/)
      ReLease = element.match(/Remaining lease: (.+)/)

      // if appear next ip adress, it's comes new data group. so previous one store and restart all
      if (ipAddr && ReIpAddr) {
        if (!hostName) hostName = '-------'
        data.push([ipAddr, macAddr, hostName, remainingLease])
        ipAddr = ''
        macAddr = ''
        hostName = ''
        remainingLease = ''
      }

      if (ReIpAddr) ipAddr = ReIpAddr[1]
      if (ReEthAddr) macAddr = ReEthAddr[1]
      if (ReClientAddr) macAddr = ReClientAddr[1].replace('(01) ', '').replace(/ /g, ':', ':')
      if (ReHostName) hostName = ReHostName[1]
      if (ReLease) remainingLease = ReLease[1]

    });
    // store last part of group
    data.push([ipAddr, macAddr, hostName, remainingLease])

    createTable(data)
    setTotalNumber(data.length)
  });

  // エラーが発生した場合に行うことを定義します
  XHR2.addEventListener('error', function (event) {
    alert('Oups! Something goes wrong.');
    console.log(event)
  });

  XHR2.open('POST', `${prefix}://${username}:${password}@${baseUrl}/detail/command_set.html`);
  XHR2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  XHR2.send(urlEncodedData);
}


function createTable(data) {
  var result = document.getElementById("result");
  while (result.firstChild) {
    result.removeChild(result.firstChild);
  }

  var newTable = document.createElement("table");
  var newThead = document.createElement("thead");
  var newThr = document.createElement("tr");
  ['IP adress', 'Mac adress', 'Host name', 'Remaining lease'].forEach(element => {
    var newThh = document.createElement("th");
    newThh.textContent = element
    newThr.appendChild(newThh);
  });
  newThead.appendChild(newThr);
  newTable.appendChild(newThead);

  var newTbody = document.createElement("tbody");
  data.forEach(element => {
    var newTr = document.createElement("tr");
    element.forEach(el => {
      var newTd1 = document.createElement("td");
      newTd1.textContent = el
      newTr.appendChild(newTd1);
    });
    newTbody.appendChild(newTr);
  });
  newTable.appendChild(newTbody);

  result.appendChild(newTable);
}

function setTotalNumber(num){
  var currentDiv = document.getElementById("resultTotal");
  currentDiv.textContent = 'Total release: ' + num
}