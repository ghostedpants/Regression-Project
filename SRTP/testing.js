
window.onload = function() {
	
	let fileData = sessionStorage.getItem('fileData');
	
	if(fileData) {
		
		console.log("File data found!");
		
		document.getElementById('fileContent').innerHTML = `<pre>${atob(fileData.split(',')[1])}</pre>`;
	}
	
};

document.getElementById('funnyButton').addEventListener('click', function() {
	
	if (document.body.style.backgroundImage) {
		// If the background is set, remove it
        document.body.style.backgroundImage = "";
    }
	else {
		document.body.style.backgroundImage = `url('hotepichedgehogs.png')`; // Set background image
        document.body.style.backgroundSize = "auto"; // Make the image cover the screen
            document.body.style.backgroundAttachment = "fixed"; // Fix the image in place to create the parallax effect
            document.body.style.backgroundPosition = "center"; // Start from the center
	}
});