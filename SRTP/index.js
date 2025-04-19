/*
Author: Jason Westmark
Date Created 4/6/2025
Purpose: Load multiple regression tabs and initialize testing
*/

document.getElementById('beginButton').addEventListener('click', async function() {
    const fileInput = document.getElementById('fileInput');

    // Ensure at least one file is selected
    if (fileInput.files.length === 0) {
        alert("No files selected. Please choose at least one regression steps file.");
        return;
    }

    // Read all selected files as Base64 data URLs
    const files = Array.from(fileInput.files);
    const readFile = file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name.replace(/\.[^.]+$/, ''), data: reader.result });
        reader.readAsDataURL(file);
    });

    try {
        const tabs = await Promise.all(files.map(readFile));
        // Store the array of tabs (name + data) in sessionStorage
        sessionStorage.setItem('tabs', JSON.stringify(tabs));

        // Store client name
        const clientName = document.getElementById('clientName').value.trim();
        localStorage.setItem('clientName', clientName);

        // Proceed to testing page
        alert("Files loaded! Starting regression testing...");
        window.location.href = 'testing.html';
    } catch (err) {
        console.error('Error reading files:', err);
        alert('There was an error loading your files. Please try again.');
    }
});
