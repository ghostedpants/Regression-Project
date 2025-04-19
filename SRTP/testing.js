/*
Author: Jason Westmark
Date Created 4/6/2025
Purpose: Make it easier for me to focus on regression testing.
*/

let pinnedLine = null;
let notes = [];

// Loads the file from the previous page through sessionStorage
window.onload = function() {
    let fileData = sessionStorage.getItem('fileData');

    // Fetch the Client Name and Tab Name from localStorage
    const clientName = localStorage.getItem('clientName');
    const tabName = localStorage.getItem('tabName');

    // Display the Client Name and Tab Name on the second page
    document.getElementById('clientName').textContent = `${clientName}`;
    document.getElementById('tabName').textContent = `${tabName}`;

    // Initialize pinned section hidden
    document.getElementById('pinned-step').style.display = 'none';
    document.getElementById('pin').textContent = 'Pin';

    // Load existing notes from localStorage
    notes = JSON.parse(localStorage.getItem('notes') || '[]');
    renderNotes();

    if (fileData) {
        console.log("File data found!");
        
        // Decode the Base64 data
        let decodedData = atob(fileData.split(',')[1]);

        // Normalize smart quotes (curly quotes) to straight ones
        decodedData = decodedData.replace(/[\u2018\u2019]/g, "'");
        decodedData = decodedData.replace(/[\u201C\u201D]/g, '"');

        // Split the decoded data by new lines (assuming it's a text file)
        lines = decodedData.split(/\r?\n/);
        
        currentLineIndex = 0;
        displayCurrentLine();
    } else {
        console.log("No file data found.");
    }
};

// Render notes list with delete and copy buttons
function renderNotes() {
    const listEl = document.getElementById('notes-list');
    listEl.innerHTML = '';
    notes.forEach((note, idx) => {
        const li = document.createElement('li');
        // Note text
        const span = document.createElement('span');
        span.textContent = note;

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋';
        copyBtn.className = 'copy-note';
        copyBtn.title = 'Copy note';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(note)
                .catch(err => console.error('Could not copy text: ', err));
        });

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = '❌';
        delBtn.className = 'delete-note';
        delBtn.title = 'Delete note';
        delBtn.addEventListener('click', () => {
            notes.splice(idx, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
        });

        li.appendChild(span);
        li.appendChild(copyBtn);
        li.appendChild(delBtn);
        listEl.appendChild(li);
    });
}

// Save note
document.getElementById('save-note').addEventListener('click', () => {
    const input = document.getElementById('note-input');
    const text = input.value.trim();
    if (text) {
        notes.unshift(text);
        localStorage.setItem('notes', JSON.stringify(notes));
        input.value = '';
        renderNotes();
    }
});

function displayCurrentLine() {
    const fileContentEl = document.getElementById('fileContent');
    
    if (lines.length > 0 && currentLineIndex < lines.length) {
        const wrappedText = wrapText(lines[currentLineIndex], 100);
        fileContentEl.innerHTML = wrappedText;
    } else {
        fileContentEl.innerHTML = 'No content to display';
    }

    const regressionLineNumberLabel = document.getElementById('lineNumber');
    regressionLineNumberLabel.textContent = `${currentLineIndex + 1} of ${lines.length}`;
}

function wrapText(text, maxLength) {
    let result = '';
    let i = 0;
    while (i < text.length) {
        result += text.substring(i, i + maxLength) + '<br>';
        i += maxLength;
    }
    return result;
}

// Navigate backward
document.getElementById('back').addEventListener('click', () => {
    if (currentLineIndex > 0) { currentLineIndex--; displayCurrentLine(); }
});
// Navigate forward
document.getElementById('skip').addEventListener('click', () => {
    if (currentLineIndex < lines.length - 1) { currentLineIndex++; displayCurrentLine(); }
});

// Update helper with emoji and comment, replacing any old comment
function updateLineWithComment(code) {
    let prefix;
    switch (code) {
        case 'P': prefix = '✅ P'; break;
        case 'F': prefix = '❌ F'; break;
        case 'N/A': prefix = '➖ N/A'; break;
        default: prefix = code;
    }
    let comment = document.getElementById('comments').value.trim();
    let original = lines[currentLineIndex];
    let parts = original.split('|');
    let baseText = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    let newLine = `${prefix} | ${baseText}`;
    if (comment) newLine += ` | ${comment}`;
    lines[currentLineIndex] = newLine;
    document.getElementById('comments').value = '';
    if (currentLineIndex < lines.length - 1) currentLineIndex++;
    displayCurrentLine();
}
// Button handlers for Pass/Fail/N/A
['pass','fail','na'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
        if (currentLineIndex < lines.length) updateLineWithComment(id==='na'?'N/A':id.charAt(0).toUpperCase());
    });
});

// Pin/Unpin functionality
document.getElementById('pin').addEventListener('click', () => {
    const pinnedStepEl = document.getElementById('pinned-step');
    const pinnedContentEl = document.getElementById('pinnedContent');
    if (!pinnedLine) {
        pinnedLine = lines[currentLineIndex];
        pinnedContentEl.innerHTML = wrapText(pinnedLine,100);
        pinnedStepEl.style.display='block';
        document.getElementById('pin').textContent='Unpin';
    } else {
        pinnedLine=null;
        pinnedStepEl.style.display='none';
        document.getElementById('pin').textContent='Pin';
    }
});

// Abort
 document.getElementById('abort').addEventListener('click', () => window.location.href='index.html');
// Download (UTF-8)
document.getElementById('download').addEventListener('click', () => {
    const modifiedContent = lines.join('\n');
    const blob = new Blob([modifiedContent],{type:'text/plain; charset=utf-8'});
    const clientName=localStorage.getItem('clientName');
    const tabName=localStorage.getItem('tabName');
    const currentDate=new Date().toLocaleDateString();
    const filename=`${clientName} - ${tabName} - ${currentDate}.txt`;
    const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=filename; link.click();
});
// Warn before leaving
window.addEventListener('beforeunload', e=>{e.preventDefault(); e.returnValue='';});
