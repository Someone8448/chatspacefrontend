client.start();
client.on('open', () => {
	client.send({m: "login", type: "token", name: localStorage.name, token: localStorage.token, id: localStorage.id});
});
var invite = (location.hash.startsWith('#') ? location.hash.slice(1) :  location.hash);
client.on('login', msg => {
	if (!msg.login) return window.location.assign(`/login/#${encodeURIComponent(location.href.substr(location.origin.length))}`);
	client.send({m: "guild", type: "list"});
	client.send({m: "guild", type: "getinv", invite: invite});
})
var appendElement = (div, type, text) => {
	var El = document.createElement(type);
	El.textContent = text;
	div.append(El);
	return div
}
document.getElementById('ban-send').onclick = () => {
	var msg = {m: "admin", type: "ban"};
	msg.ban = (document.getElementById('ban-bool').value === 'true') ? true : false;
	msg[document.getElementById('ban-usertype').value] = document.getElementById('ban-user').value;
	client.send(msg)
}
document.getElementById('bot-send').onclick = () => {
	var msg = {m: "admin", type: "bot"};
	msg.bot = (document.getElementById('bot-bool').value === 'true') ? true : false;
	msg[document.getElementById('bot-usertype').value] = document.getElementById('bot-user').value;
	client.send(msg)
}
document.getElementById('reset-send').onclick = () => {
	var msg = {m: "admin", type: "reset"};
	msg.pass = document.getElementById('reset-password').value;
	msg[document.getElementById('reset-usertype').value] = document.getElementById('reset-user').value;
	client.send(msg)
}
document.getElementById('delfile-send').onclick = () => {
	var msg = {m: "admin", type: "delfile"};
	msg.file = document.getElementById('delfile-file').value;
	client.send(msg)
}

document.getElementById('file-send').onclick = () => {
        var msg = {m: "admin", type: "files"};
        client.send(msg);
};
client.on('admin', msg => {
        if (msg.type !== "files") return;
        var appendElement = (div, type, text) => {
                var El = document.createElement(type);
                if (text) El.textContent = text;
                div.append(El);
                return El;
        };
        var listDiv = document.getElementById('file-list');
        listDiv.innerHTML = "";
        if (!msg.files.length) return appendElement(listDiv, 'span', 'There are no files.');
        msg.files.forEach(file => {
                var fileDiv = appendElement(listDiv, 'div');
                if (file.safe) appendElement(fileDiv, 'b', '(SAFE) ');
                appendElement(fileDiv, 'b', `${file.id}`);
                appendElement(fileDiv, 'span', ` uploaded on ${new Date(file.time)}, ${Number((file.size / (1024 * 1024)).toFixed(2)).toLocaleString()}MB by user ID `);
                var userID = appendElement(fileDiv, 'b', file.user + ' ');
                userID.onclick = () => {
                        window.open(location.origin + '/user/#' + file.user);
                };
                if (file.ft && ['audio', 'image', 'video'].includes(file.ft.split('/')[0])) {
                        var fileht = {e: false};
                        var showButton = appendElement(fileDiv, 'button', 'Show')
                        showButton.type = "button";
                        showButton.onclick = () => {
                                if (fileht.e) {
                                        fileht.f.remove();
                                        fileht.e = false;
                                        showButton.textContent = "Show";
                                } else {
                                        var start = file.ft.split('/')[0];
                                        if (start === "image") {
                                                fileht.f = document.createElement('img');
                                                fileht.f.src = location.origin + '/files/' + file.id;
                                        } else {
                                                fileht.f = document.createElement(start);
                                                fileht.f.setAttribute('controls', '');
                                                var sourceEl = document.createElement('source');
                                                sourceEl.src = location.origin + '/files/' + file.id;
                                                fileht.f.append(sourceEl);
                                        }
                                        fileht.f.style.maxWidth = "50%";
                                        fileht.f.style.maxHeight = "50%";
                                        fileDiv.append(fileht.f);
                                        fileht.e = true;
                                        showButton.textContent = "Hide";
                                }
                        }
                } else {
                        var downloadButton = appendElement(fileDiv, 'button', 'Download')
                        downloadButton.type = "button";
                        downloadButton.onclick = () => {
                                window.open(location.origin + '/files/' + file.id);
                        }
                }
                var delButton = appendElement(fileDiv, 'button', 'Delete');
                delButton.type = "button";
                delButton.onclick = () => {
                        if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) return;
                         client.send({m: "admin", type: "delfine", file: file.id});
                        fileDiv.remove();
                }
                if (!file.safe) {
                var safeButton = appendElement(fileDiv, 'button', 'Safe');
                safeButton.type = "button";
                safeButton.onclick = () => {
                        if (!confirm('Are you sure you want to set this file to safe? This cannot be undone.')) return;
						client.send({m: "admin", type: "safe", file: file.id});
                        var safes = document.createElement('b');
                        safes.textContent = "(SAFE) ";
                        fileDiv.prepend(safes);
                        safeButton.remove();
                }
                }
                appendElement(fileDiv, 'br');
        })
})
