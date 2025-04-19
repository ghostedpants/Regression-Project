/*
Author: Jason Westmark
Date Created 4/6/2025
Purpose: Multi-tab regression testing with scoped per-tab state (lines, position, pinnedLine, notes) and UTF-8 safe Base64 handling
*/

let tabs = [];
let currentTabIndex = 0;
let currentLineIndex = 0;
let lines = [];

// UTF-8 safe Base64 encoding/decoding
function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64) {
    return decodeURIComponent(escape(atob(b64)));
}

window.onload = function() {
    const stored = sessionStorage.getItem('tabs');
    if (!stored) {
        alert('No regression tabs found. Please start from the index page.');
        return;
    }
    tabs = JSON.parse(stored).map(tab => ({
        name: tab.name,
        data: tab.data,
        position: tab.position || 0,
        pinnedLine: tab.pinnedLine || null,
        notes: tab.notes || []
    }));

    document.getElementById('clientName').textContent = localStorage.getItem('clientName') || '';

    const tabSelect = document.getElementById('tabSelect');
    tabs.forEach((tab, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = tab.name;
        tabSelect.appendChild(opt);
    });
    tabSelect.value = 0;
    tabSelect.addEventListener('change', () => switchTab(Number(tabSelect.value)));

    loadTab(0);
};

function switchTab(newIndex) {
    saveTabState();
    currentTabIndex = newIndex;
    loadTab(newIndex);
}

function saveTabState() {
    tabs[currentTabIndex].data = 'data:text/plain;base64,' + toBase64(lines.join('\n'));
    tabs[currentTabIndex].position = currentLineIndex;
    sessionStorage.setItem('tabs', JSON.stringify(tabs));
}

function loadTab(index) {
    const tab = tabs[index];
    document.getElementById('tabName').textContent = tab.name;

    const b64 = tab.data.split(',')[1];
    const raw = fromBase64(b64);
    lines = raw.split(/\r?\n/);

    currentLineIndex = Math.min(tab.position, lines.length - 1);

    const pinnedEl = document.getElementById('pinned-step');
    const pc = document.getElementById('pinnedContent');
    const pinBtn = document.getElementById('pin');
    if (tab.pinnedLine) {
        pc.innerHTML = wrapText(tab.pinnedLine, 100);
        pinnedEl.style.display = 'block';
        pinBtn.textContent = 'Unpin';
    } else {
        pinnedEl.style.display = 'none';
        pinBtn.textContent = 'Pin';
    }

    renderNotes();
    displayCurrentLine();
}

function displayCurrentLine() {
    const fc = document.getElementById('fileContent');
    fc.innerHTML = lines[currentLineIndex] ? wrapText(lines[currentLineIndex], 100) : 'No content to display';
    document.getElementById('lineNumber').textContent = `${currentLineIndex + 1} of ${lines.length}`;
}

function wrapText(text, maxLen) {
    let out = '';
    for (let i = 0; i < text.length; i += maxLen) {
        out += text.substr(i, maxLen) + '<br>';
    }
    return out;
}

['back','skip'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
        if (id === 'back' && currentLineIndex > 0) currentLineIndex--;
        if (id === 'skip' && currentLineIndex < lines.length - 1) currentLineIndex++;
        saveTabState();
        displayCurrentLine();
    });
});

function updateLineWithComment(code) {
    const map = { P: '✅ P', F: '❌ F', 'N/A': '➖ N/A' };
    const prefix = map[code];
    const commentText = document.getElementById('comments').value.trim();

    const parts = lines[currentLineIndex].split('|');
    const base = parts[1] ? parts[1].trim() : parts[0].trim();
    lines[currentLineIndex] = prefix + ' | ' + base + (commentText ? ' | ' + commentText : '');
    document.getElementById('comments').value = '';

    if (currentLineIndex < lines.length - 1) currentLineIndex++;
    saveTabState();
    displayCurrentLine();
}
['pass','fail','na'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => updateLineWithComment(id === 'na' ? 'N/A' : id.charAt(0).toUpperCase()));
});

document.getElementById('pin').addEventListener('click', () => {
    const tab = tabs[currentTabIndex];
    if (!tab.pinnedLine) {
        tab.pinnedLine = lines[currentLineIndex];
        document.getElementById('pinnedContent').innerHTML = wrapText(tab.pinnedLine, 100);
        document.getElementById('pinned-step').style.display = 'block';
        document.getElementById('pin').textContent = 'Unpin';
    } else {
        tab.pinnedLine = null;
        document.getElementById('pinned-step').style.display = 'none';
        document.getElementById('pin').textContent = 'Pin';
    }
    saveTabState();
});

function renderNotes() {
    const list = document.getElementById('notes-list');
    list.innerHTML = '';
    const tab = tabs[currentTabIndex];
    tab.notes.forEach((note, idx) => {
        const li = document.createElement('li');
        const span = document.createElement('span'); span.textContent = note;
        const copyBtn = document.createElement('button'); copyBtn.textContent = '📋'; copyBtn.className = 'copy-note';
        copyBtn.onclick = () => navigator.clipboard.writeText(note);
        const delBtn = document.createElement('button'); delBtn.textContent = '❌'; delBtn.className = 'delete-note';
        delBtn.onclick = () => { tab.notes.splice(idx, 1); saveTabState(); renderNotes(); };
        li.append(span, copyBtn, delBtn);
        list.appendChild(li);
    });
}

document.getElementById('save-note').addEventListener('click', () => {
    const text = document.getElementById('note-input').value.trim(); if (!text) return;
    tabs[currentTabIndex].notes.unshift(text);
    document.getElementById('note-input').value = '';
    saveTabState();
    renderNotes();
});

document.getElementById('download').addEventListener('click', () => {
    const b64 = tabs[currentTabIndex].data.split(',')[1];
    const blob = new Blob([fromBase64(b64)], { type: 'text/plain; charset=utf-8' });
    const clientName = localStorage.getItem('clientName') || '';
    const filename = `${clientName} - ${tabs[currentTabIndex].name} - ${new Date().toLocaleDateString()}.txt`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
});

document.getElementById('abort').addEventListener('click', () => window.location.href = 'index.html');
window.addEventListener('beforeunload', e => { e.preventDefault(); e.returnValue = ''; });
