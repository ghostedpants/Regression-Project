/*
Author: Jason Westmark
Date Created 4/6/2025
Purpose: Make it easier for me to focus on regression testing.
*/

// Loads the file from the previous page through sessionStorage
window.onload = function() {
    let fileData = sessionStorage.getItem('fileData');

    // Fetch the Client Name and Tab Name from localStorage
    const clientName = localStorage.getItem('clientName');
    const tabName = localStorage.getItem('tabName');

    // Display the Client Name and Tab Name on the second page
    document.getElementById('clientName').textContent = `${clientName}`;
    document.getElementById('tabName').textContent = `${tabName}`;

    if (fileData) {
        console.log("File data found!");
        
        // Decode the Base64 data
        let decodedData = atob(fileData.split(',')[1]);  // Decode Base64 data

        // Split the decoded data by new lines (assuming it's a text file)
        lines = decodedData.split(/\r?\n/);  // Split into lines
        
        currentLineIndex = 0;  // Start at the first line
        displayCurrentLine();  // Display the first line
    } else {
        console.log("No file data found.");
    }
};

// Function to display the current line of the file
function displayCurrentLine() {
    const fileContentEl = document.getElementById('fileContent');

    // Check if there are lines available
    if (lines.length > 0 && currentLineIndex < lines.length) {
        fileContentEl.innerHTML = `<pre>${lines[currentLineIndex]}</pre>`;  // Show the current line
    } else {
        fileContentEl.innerHTML = `<pre>No content to display</pre>`;
    }

    // Update the line number label
    const regressionLineNumberLabel = document.getElementById('lineNumber');
    regressionLineNumberLabel.textContent = `${currentLineIndex + 1} of ${lines.length}`;
}

// Event listener for the "Back" button
document.getElementById('back').addEventListener('click', () => {
    if (currentLineIndex > 0) {
        currentLineIndex--;  // Go to the previous line
        displayCurrentLine();  // Update the display
    }
});

// Event listener for the "Skip" button
document.getElementById('skip').addEventListener('click', () => {
    if (currentLineIndex < lines.length - 1) {
        currentLineIndex++;  // Go to the next line
        displayCurrentLine();  // Update the display
    }
});

// Helper function to update the current line with "P" or "F" and comment
function updateLineWithComment(status) {
    // Get the comment entered by the user
    let comment = document.getElementById('comments').value.trim();

    // Get the current line
    let line = lines[currentLineIndex];

    // Match the existing "P | ..." or "F | ..." part and any comment
    let regex = /^[PF]\s*\|[^|]*(\|.*)?$/;
    let match = line.match(regex);

    // If we find an existing "P/F | ..." part, preserve it and remove only the comment part
    if (match) {
        line = line.replace(regex, `${status} | ${line.split('|')[1].trim()}`);  // Update the status but keep the rest of the line
    } else {
        // If no "P | ..." or "F | ..." exists, just prepend the status
        line = `${status} | ${line}`;
    }

    // Add the comment if provided, or leave it empty
    if (comment) {
        line += ` | ${comment}`;
    }

    // Update the line in the array
    lines[currentLineIndex] = line;

    // Reset the comment box after adding the comment
    document.getElementById('comments').value = "";

    // Move to the next line if possible
    if (currentLineIndex < lines.length - 1) {
        currentLineIndex++;  // Move to the next line
    }

    displayCurrentLine();  // Update the display
}

// Event listener for the "Pass" button (adds "P" and comment to the current line)
document.getElementById('pass').addEventListener('click', () => {
    if (currentLineIndex < lines.length) {
        updateLineWithComment("P");  // Update the line with "P" and comment
    }
});

// Event listener for the "Fail" button (adds "F" and comment to the current line)
document.getElementById('fail').addEventListener('click', () => {
    if (currentLineIndex < lines.length) {
        updateLineWithComment("F");  // Update the line with "F" and comment
    }
});

// Funny button code for toggling background image
document.getElementById('funnyButton').addEventListener('click', function() {
    if (document.body.style.backgroundImage) {
        // If the background is set, remove it
        document.body.style.backgroundImage = "";
    } else {
        // Set a new background image with parallax effect
        document.body.style.backgroundImage = `url('hotepichedgehogs.png')`;
        document.body.style.backgroundSize = "auto";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundPosition = "center";
    }
});

// Event listener for the "Abort" button
document.getElementById('abort').addEventListener('click', () => {
    window.location.href = "index.html";  // Redirect to the main page
});

// Event listener for the "Download" button
document.getElementById('download').addEventListener('click', () => {
    // Join the lines back together into a single string, each line separated by a new line
    let modifiedContent = lines.join('\n');
    
    // Create a Blob from the modified content
    let blob = new Blob([modifiedContent], { type: 'text/plain' });
    
    // Get the client name, tab name, and current date
    const clientName = localStorage.getItem('clientName');
    const tabName = localStorage.getItem('tabName');
    const currentDate = new Date().toLocaleDateString();  // This gives the date in "MM/DD/YYYY" format
    
    // Format the filename
    const filename = `${clientName} - ${tabName} - ${currentDate}.txt`;
    
    // Create an anchor element for triggering the download
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;  // Set the filename with the format
    
    // Trigger the download by simulating a click on the link
    link.click();
});

// Warn the user before they accidentally refresh or leave the page
window.addEventListener('beforeunload', function (e) {
    e.preventDefault(); // Standard for most browsers
    e.returnValue = ''; // Required for Chrome to show the dialog
});
