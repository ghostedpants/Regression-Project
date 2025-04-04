


document.getElementById('beginButton').addEventListener('click', function() {
	
	let fileInput = document.getElementById("fileInput");
	
	//Checks if there has been a file selected by the user yet
	if(fileInput.files.length > 0) {
		
		/* Makes file a variable that holds the file input by the user*/
		let file = fileInput.files[0];
		
		// Store the file name in sessionStorage
        sessionStorage.setItem('fileName', file.name);
		
		//Create a file reader to read the file into Base64 (a string)
		let reader = new FileReader();
		
		reader.onloadend = function() {
			
			//Store the string in sessionStorage
			sessionStorage.setItem('fileData', reader.result);
			
		};
		
		//I don't know what this does
		reader.readAsDataURL(file);
		
		alert("You have indeed selected a file! Moving on to the program...");
		window.location.href = "testing.html";
	}
	else {
		alert("Hmmm... You didn't select anything. Are you sure you know what you're doing?");	
	}
});