var tabIdCount = 3;
var windowIdCount = 2;
var setupIdCount = 2;

var EXISTS = false;

//Run our extension script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
//	chrome.storage.sync.clear(); //use to clear storage
	setupListeners();
	loadExistingSetups();
});

function setupListeners(){
    document.getElementById("deleteUrlButton1").addEventListener("click", deleteUrl);
	document.getElementById("addUrlButton2").addEventListener("click", addUrl);
    document.getElementById("deleteWindowButton1").addEventListener("click", deleteWindow);
	document.getElementById("addWindowButton1").addEventListener("click", addWindow);
	document.getElementById("saveSetup1").addEventListener("click", saveSetup);

    var firstSetup = document.getElementById('setup1');
    firstSetup.addEventListener('dragenter', handleDragEnter, false);
    firstSetup.addEventListener('dragover', handleDragOver, false);
    firstSetup.addEventListener('dragleave', handleDragLeave, false);
    firstSetup.addEventListener('drop', handleDrop, false);

	var firstWindow = document.getElementById("window1");
	firstWindow.addEventListener('dragstart', handleDragStart, false);
    firstWindow.addEventListener('dragend', handleDragEnd, false);
	firstWindow.addEventListener('dragenter', handleDragEnter, false);
	firstWindow.addEventListener('dragover', handleDragOver, false);
	firstWindow.addEventListener('dragleave', handleDragLeave, false);
    firstWindow.addEventListener('drop', handleDrop, false);

	var firstDD = firstWindow.getElementsByTagName("DD")[0];
	firstDD.addEventListener('dragstart', handleDragStart, false);
	firstDD.addEventListener('dragend', handleDragEnd, false);
	firstDD.addEventListener('dragenter', handleDragEnter, false);
	firstDD.addEventListener('dragover', handleDragOver, false);
    firstDD.addEventListener('dragleave', handleDragLeave, false);
    firstDD.addEventListener('drop', handleDrop, false);



	chrome.runtime.onMessage.addListener(
		  function(request) {
		    if (request.greeting == "update")
                EXISTS = request.exists;
		    	updateModifySetupList(JSON.parse(request.payload));
		  });

}
/**
Add a new tab for the window
**/
function addUrl(inputValue){
	var value = "";
	if("string" == (typeof inputValue)){
		value = inputValue;
	}

	var tabIDNumber = tabIdCount++;

	var curWindow = this.parentNode.parentNode.parentNode;
	curWindow.getElementsByTagName("DL")[0].appendChild(createUrlSection(0, tabIDNumber, value));

    var ddList = curWindow.getElementsByTagName("DL")[0].getElementsByTagName("DD");

    fixFirstURL(ddList);
}

function createUrlSection(firstUrl, tabIDNumber, value){
	var tempDD = document.createElement("DD");

	tempDD.setAttribute("draggable", "true");
	tempDD.addEventListener('dragstart', handleDragStart, false);
	tempDD.addEventListener('dragend', handleDragEnd, false);
	tempDD.addEventListener('dragenter', handleDragEnter, false);
	tempDD.addEventListener('dragover', handleDragOver, false);
	tempDD.addEventListener('dragleave', handleDragLeave, false);
    tempDD.addEventListener('drop', handleDrop, false);


	var tempLabel = document.createElement("LABEL");
	tempLabel.setAttribute("for", "setupURL" + tabIDNumber);
	if(firstUrl){
		tempLabel.innerHTML = "URL(Required): ";
	}
	else{
		tempLabel.innerHTML = "URL(Optional): ";
	}
	tempDD.appendChild(tempLabel);

    //fix to get spacing correct
    if(!firstUrl){
        var spaceSpan = document.createElement("SPAN");
        spaceSpan.setAttribute("class", "spaceSpan");
        tempDD.appendChild(spaceSpan);
    }

	var tempAdd = document.createElement("INPUT");
	tempAdd.setAttribute("type", "text");
	tempAdd.setAttribute("class", "urlInput");
	tempAdd.setAttribute("name", "setupURL");
	tempAdd.setAttribute("value", value);
	tempAdd.setAttribute("id", "setupURL" + tabIDNumber);
	tempAdd.setAttribute("size", "30");
	tempDD.appendChild(tempAdd);

	if(firstUrl){
        createFirstUrlButtons(tempDD, tabIDNumber);
	}
    else{
        var tempButton = document.createElement("INPUT");
        tempButton.setAttribute("type", "button");
		tempButton.setAttribute("id", "deleteUrlButton" + tabIDNumber);
		tempButton.setAttribute("value", "(-) delete URL");
		tempButton.setAttribute("class", "urlButton");
		tempButton.addEventListener("click", deleteUrl);
		tempDD.appendChild(tempButton);
	}
	return tempDD;
}

function createFirstUrlButtons(tempDD, tabIDNumber){

    var extraDeleteButton = document.createElement("INPUT");
    extraDeleteButton.setAttribute("type", "button");
    extraDeleteButton.setAttribute("id", "deleteUrlButton" + tabIDNumber);
    extraDeleteButton.setAttribute("value", "(-) delete URL");
    extraDeleteButton.setAttribute("class", "urlButton");
    extraDeleteButton.addEventListener("click", deleteUrl);
    tempDD.appendChild(extraDeleteButton);

    var tempButton = document.createElement("INPUT");
    tempButton.setAttribute("type", "button");
    tempButton.setAttribute("id", "addUrlButton" + tabIDNumber);
    tempButton.setAttribute("value", "(+) add URL");
    tempButton.setAttribute("class", "urlButton");
    tempButton.addEventListener("click", addUrl);
    tempDD.appendChild(tempButton);

    var tempErrorDiv = document.createElement("SPAN");
    tempErrorDiv.setAttribute("id", "windowURLErrorMsg" + tabIDNumber);
    tempDD.appendChild(tempErrorDiv);

}

function deleteUrl(){
	var tempDD = this.parentNode;
	var tempDL = tempDD.parentNode;

    //check if first URL, if so need to add some fixes
    var buttons = tempDD.getElementsByTagName("INPUT");

    if(buttons.length > 0) {
        //get DD lists
        var ddList = tempDL.getElementsByTagName("DD");

        if(buttons[buttons.length - 1].value == "(+) add URL" && ddList.length < 2){
            return;
        }
        //remove the url
        tempDL.removeChild(tempDD);

        fixFirstURL(ddList);

    }
}
/**
 * Adds the delete add buttons and error msg span for when buttons are either delete or added
 * @param ddList
 */
function fixFirstURL(ddList){

    if(ddList.length > 0){
        var firstDD = ddList[0];
        //var tabNumber = parseInt(tempTabs[0].id.slice("setupURL".length));
        var label = firstDD.getElementsByTagName("LABEL")[0];

        label.innerHTML = "URL(Required): ";

        var tabNumber = parseInt(label.getAttribute("for").slice("setupURL".length));

        var buttons = firstDD.getElementsByClassName("urlButton");

        if(buttons.length > 0 && buttons[buttons.length - 1].value != "(+) add URL"){

            for(var i=0; i < buttons.length; i++){
                firstDD.removeChild(buttons[i]);
            }
            createFirstUrlButtons(firstDD, tabNumber);
        }

        var deleteButton = firstDD.getElementsByTagName("INPUT")[1];
        if(ddList.length == 1){
            deleteButton.setAttribute("class", deleteButton.className + " onlyOne");
        }
        else{
            deleteButton.setAttribute("class", "urlButton");
        }
    }

}

function addWindow(inputValue){

	var actionCall = 1;
	var firstWindow = 0;
	var setupID = null;
	if("number" == (typeof inputValue)){
		setupID = inputValue;
		actionCall = 0;
	}

	var windowIDNumber = windowIdCount++;
	var tabIDNumber = tabIdCount++;
	//add div for new window
	var windowDiv = document.createElement("DIV");
	windowDiv.setAttribute("id", "window" + windowIDNumber);
	windowDiv.setAttribute("class", "window");

    windowDiv.setAttribute("draggable", "true");

	windowDiv.addEventListener('dragstart', handleDragStart, false);
	windowDiv.addEventListener('dragend', handleDragEnd, false);
	windowDiv.addEventListener('dragenter', handleDragEnter, false);
	windowDiv.addEventListener('dragover', handleDragOver, false);
	windowDiv.addEventListener('dragleave', handleDragLeave, false);
    windowDiv.addEventListener('drop', handleDrop, false);

	if(actionCall){
		this.parentNode.insertBefore(windowDiv, this);
	}
	else{
		var setupListDiv = document.getElementById("setupList" + setupID);
		var windowList = setupListDiv.getElementsByClassName("window");

		if(windowList.length < 1){
			firstWindow = 1;
			setupListDiv.appendChild(windowDiv);
		}
		else{
			var addWindowButton = document.getElementById("addWindowButton" + setupID);
			setupListDiv.insertBefore(windowDiv, addWindowButton);
		}
	}
	//add new window header
	var tempHeader = document.createElement("H3");
	tempHeader.innerHTML = "Window";
	windowDiv.appendChild(tempHeader);

	//add hidden values for the window position
	var windowMaximized = document.createElement("INPUT");
	windowMaximized.setAttribute("id", "windowMaximized" + windowIDNumber);
	windowMaximized.setAttribute("type", "hidden");
	windowMaximized.setAttribute("value", true);
	windowDiv.appendChild(windowMaximized);

	var windowTop = document.createElement("INPUT");
	windowTop.setAttribute("id", "windowTop" + windowIDNumber);
	windowTop.setAttribute("type", "hidden");
	windowTop.setAttribute("value", 1);
	windowDiv.appendChild(windowTop);

	var windowLeft = document.createElement("INPUT");
	windowLeft.setAttribute("id", "windowLeft" + windowIDNumber);
	windowLeft.setAttribute("type", "hidden");
	windowLeft.setAttribute("value", 1);
	windowDiv.appendChild(windowLeft);

	var windowHeight = document.createElement("INPUT");
	windowHeight.setAttribute("id", "windowHeight" + windowIDNumber);
	windowHeight.setAttribute("type", "hidden");
	windowHeight.setAttribute("value", 1);
	windowDiv.appendChild(windowHeight);

	var windowWidth = document.createElement("INPUT");
	windowWidth.setAttribute("id", "windowWidth" + windowIDNumber);
	windowWidth.setAttribute("type", "hidden");
	windowWidth.setAttribute("value", 1);
	windowDiv.appendChild(windowWidth);

    if(firstWindow){
        var tempAdd = document.createElement("INPUT");
        tempAdd.setAttribute("type", "button");
        tempAdd.setAttribute("id", "addWindowButton" + setupID);
        tempAdd.setAttribute("value", "(+) Add a new window");
        tempAdd.addEventListener("click", addWindow);
        windowDiv.parentNode.appendChild(tempAdd);
    }

	//add delete window button
    var tempDelete = document.createElement("INPUT");
    tempDelete.setAttribute("type", "button");
    tempDelete.setAttribute("id", "deleteWindowButton" + windowIDNumber);
    tempDelete.setAttribute("value", "(-) Delete Window");
    tempDelete.addEventListener("click", deleteWindow);
    windowDiv.appendChild(tempDelete);

	var tempDL = document.createElement("DL");
	windowDiv.appendChild(tempDL);

	var urlInputList = document.getElementsByClassName("urlInput");
	var tabIDNumber = tabIdCount++;

	if(actionCall){
		tempDL.appendChild(createUrlSection(1, tabIDNumber, ""));
	}
    //TODO:
    //fixFirstURL(tempDL.getElementsByTagName("DD"));

    if(actionCall){
        fixFirstWindow(this.parentNode.parentNode);
    }
    else {
        fixFirstWindow(setupListDiv);
    }
	return windowDiv;
}

function deleteWindow(){
	var window = this.parentNode;
	var parent = window.parentNode;

    if (parent.getElementsByClassName('window').length > 1){
        parent.removeChild(window);

        fixFirstWindow(parent);
    }
}

function fixFirstWindow(setupList){

    var tempWindows = setupList.getElementsByClassName('window');

    var deleteButton = tempWindows[0].getElementsByTagName('input')[5];

    if(tempWindows.length < 2){
       deleteButton.classList.add('onlyOne');
    }
    else{
        deleteButton.classList.remove('onlyOne');
    }
}

function deleteSetup(){
	var setup = this.parentNode;
	var parent = setup.parentNode;
	var id = this.id.slice("deleteSetup".length);
	var name = document.getElementById("setupNameHiddenName" + id).value;

	parent.removeChild(setup);

	parent.remove
	chrome.storage.sync.get(["webSetupsList"], function(items){

		var savedWebSetupsList = items.webSetupsList;

		for(var i=0; i<savedWebSetupsList.length; i++){
			var storedName = JSON.parse(savedWebSetupsList[i]).name;
			if(storedName == name){
				savedWebSetupsList.splice(i, 1);
				break;
			}
		}
		//saving the new list of setups by deleting this one.
		chrome.storage.sync.set({'webSetupsList': savedWebSetupsList}, function(){
			//message('Settings saved');
		});

	});
}

function saveSetup(){
	/* check if this is an existing setup that has already been saved,
	 * if so then different actions are taken to make sure it overwrites the previous
	 * saved version of the setup.
	 */
	var isModifiedSetup = 0;
	if(parseInt(this.id.slice("saveSetup".length)) > 1){
		//alert("This is a modified setup");
		isModifiedSetup = 1;
	}

	var parent = this.parentNode;
	var parentID = parseInt(parent.id.slice("setup".length));
	var nameInput = parent.getElementsByClassName("name")[0];
	var name = nameInput.value;

	var savedWebSetupsList = null;
	//need to check if name is not used yet, if it is return, and insert message already exist
	//remove insert message if name does not exist
	chrome.storage.sync.get(["webSetupsList"], function(items){

		var boolReturn = 0;
		if(name == ''){
			boolReturn = 1;
		}
		else if(items == null || items.webSetupsList == null){
			boolReturn = 0;
		}
		else{
			//items.webSetupsList is parsed already when it is saved, so we should turn it back into an object.
			savedWebSetupsList = items.webSetupsList
			//alert("existed: " + savedWebSetupsList);

			for(var i=0; i<savedWebSetupsList.length; i++){
				var storedName = JSON.parse(savedWebSetupsList[i]).name;
				if(storedName == name){
					//alert("name exists in saved data");
					var hiddenName = document.getElementById("setupNameHiddenName" + parentID);
					if(!( (hiddenName != null) && (hiddenName.value == storedName) && (isModifiedSetup) )){
						boolReturn = 1;
					}
				}
			}
		}
		//if name already exists or name is empty, insert error message and return
		if(boolReturn){
			//alert("name already existed or empty, not saving");
			//check if error message already exists
			var tempNameErrorMsg = document.getElementById("nameErrorMsg" + parentID);

			if(tempNameErrorMsg == null){
				var errorNameMsg = document.createElement("LABEL");
				errorNameMsg.setAttribute("for", nameInput.id);
				errorNameMsg.setAttribute("id", "nameErrorMsg" + parentID);
                errorNameMsg.setAttribute("class", "errorMsg");
				if(name == ''){
					errorNameMsg.innerHTML = "Name cannot be empty.";
				}
				else{
					errorNameMsg.innerHTML = "Name already exist, choose another.";
				}
				var validNameDiv = document.getElementById("setupNameValid" + parentID);
				validNameDiv.appendChild(errorNameMsg);
			}
			else{//just change the error message if required.
				if(name == ''){
					tempNameErrorMsg.innerHTML = "Name cannot be empty.";
				}
				else{
					tempNameErrorMsg.innerHTML = "Name already exist, choose another.";
				}
			}
			return;
		}
		else{
			//alert("We good no setup already exist.");
			var errorNameMsg = document.getElementById("nameErrorMsg" + parentID);
			if(errorNameMsg != null){
				var errorNameMsgParent = errorNameMsg.parentNode;
				errorNameMsgParent.removeChild(errorNameMsg);
			}
		}

		var webSetups = new WebsiteSetup(name);

		if(!document.getElementById("RemovePreviousWindows" + parentID).checked){
			webSetups.removePrevWindows = false;
		}


		var tempWindows = parent.getElementsByClassName("window");
        //alert("length is " + tempWindows.length);

		var urlReturn  = 0;
		for(i=0; i<tempWindows.length; i++){
			var windowNumber = parseInt(tempWindows[i].id.slice("window".length));

            //alert("window # is " + windowNumber);
			//NEED TO GET PREVIOUS WINDOW INFORMATION
			/*
			 * NEED HIDDEN VARIABLES HERE TO KEEP TRACK OF WINDOW DIMENSIONS
			 */
			//new WebsiteWindow(window.top, window.left, window.height, window.width, true);
			var tempWindow = null;
			if(!isModifiedSetup){
				tempWindow = new WebsiteWindow(1, 1, 1, 1, true);
			}
			else{
				//need to get window positions
				tempWindow = new WebsiteWindow(
						parseInt(document.getElementById("windowTop" + windowNumber).value),
						parseInt(document.getElementById("windowLeft" + windowNumber).value),
						parseInt(document.getElementById("windowHeight" + windowNumber).value),
						parseInt(document.getElementById("windowWidth" + windowNumber).value),
						document.getElementById("windowMaximized" + windowNumber).value == "true" ? true : false
						);
			}

			var tempTabs = tempWindows[i].getElementsByClassName("urlInput");

			//check if first URL tab is not empty, if so error message
			if(tempTabs[0].value == ''){
				//alert("url error message");
				if(tempWindows[i].getElementsByClassName("errorMsg").length == 0){
					var errorUrlMsg = document.createElement("Label");
					errorUrlMsg.setAttribute("for", tempTabs[0].id);
					errorUrlMsg.setAttribute("class", "errorMsg");
					errorUrlMsg.innerHTML = "Please insert an URL.";

					//var windowNumber = parseInt(tempWindows[i].id.slice("window".length));
					var tabNumber = parseInt(tempTabs[0].id.slice("setupURL".length));
					var errorMsgDiv = document.getElementById("windowURLErrorMsg" + tabNumber);
					errorMsgDiv.appendChild(errorUrlMsg);
				}
				urlReturn = 1;
			}
			else{
				if(tempWindows[i].getElementsByClassName("urlErrorMessage").length != 0){
//					var windowNumber = parseInt(tempWindows[i].id.slice("window".length));
					var errorMsgDiv = document.getElementById("windowURLErrorMsg" + windowNumber);

					errorMsgDiv.removeChild(errorMsgDiv.firstChild);
				}
			}

			for(var j=0; j<tempTabs.length; j++){
				//check first url is not empty
				if(tempTabs[j].value != ''){
					var tempTab = new WebsiteTab(tempTabs[j].value);
					tempWindow.tabs.push(tempTab);

				}
			}
			webSetups.windows.push(tempWindow);
		}
		if(urlReturn){
			return;
		}

		if(savedWebSetupsList == null){
			savedWebSetupsList = [];
		}

		if(!isModifiedSetup){
			savedWebSetupsList.push(JSON.stringify(webSetups))
		}
		else{//searches for previous save and replace it with the newer version
			for(var i=0; i<savedWebSetupsList.length; i++){
				var storedName = JSON.parse(savedWebSetupsList[i]).name;
				var hiddenName = document.getElementById("setupNameHiddenName" + parentID).value;
				if(storedName == hiddenName){
					savedWebSetupsList[i] = JSON.stringify(webSetups);
				}
			}
		}

		//alert("Save: " + JSON.stringify(savedWebSetupsList));

		//saving new setup
		chrome.storage.sync.set({'webSetupsList': savedWebSetupsList}, function(){
			//message('Settings saved');
		});


		//need to clear all the input to empty
		if(parentID == 1){
			cleanAddNewSetup(parent, 1);
		}
		//Below will put a save message for the save and then have the save message disappear after 5 seconds
		var saveSetupStateDiv = document.getElementById("setupStateMsg" + parentID);
		var saveSetupStateMsg = document.createElement("Label");
		saveSetupStateMsg.setAttribute("for", this.id);
		saveSetupStateMsg.setAttribute("class", "setupStateMsg");
		saveSetupStateMsg.innerHTML = "Save was successful!";
		saveSetupStateDiv.appendChild(saveSetupStateMsg);

		setTimeout(function(){
			var saveSetupStateDiv = document.getElementById("setupStateMsg" + parentID);
			var saveSetupStateMsg = document.getElementsByClassName("setupStateMsg")[0];
			saveSetupStateDiv.removeChild(saveSetupStateMsg);
		}, 5000, parentID);

		//1. NEED TO ADD A LISTENER TO THIS TO UPDATE MODIFY INFO
		if(!isModifiedSetup){
			updateModifySetupList(webSetups);
		}
	});
}

function updateModifySetupList(webSetup){
	var mainDiv = document.getElementById("modifySavedSetups");
	//adding basic divs that will hold each setup
	var setupDiv = document.createElement("DIV");
	var setupID = setupIdCount++;
	setupDiv.setAttribute("id", "setup" + setupID);
	setupDiv.setAttribute("class", "setup");

    setupDiv.addEventListener('dragenter', handleDragEnter, false);
    setupDiv.addEventListener('dragover', handleDragOver, false);
    setupDiv.addEventListener('dragleave', handleDragLeave, false);
    setupDiv.addEventListener('drop', handleDrop, false);

    var position = -1;

    if(EXISTS){
        var setups = mainDiv.getElementsByClassName('setup');

        for(var i=0; i < setups.length; i++){

            if(webSetup.name == setups[i].getElementsByTagName('input')[0].value){


                mainDiv.insertBefore(setupDiv, setups[i]);
                //mainDiv.removeChild(setups[i]);
                position = i + 1;

                break;
            }
        }
    }
    else{
        mainDiv.appendChild(setupDiv);
    }
	//adding name div
	var nameDiv = createNameSection(webSetup.name, setupID);

	setupDiv.appendChild(nameDiv);

	if(!webSetup.removePrevWindows){
		document.getElementById("RemovePreviousWindows" + setupID).checked = false;
	}

	//add the div that will contain the list of windows
	var setupListDiv = document.createElement("DIV");
	setupListDiv.setAttribute("id", "setupList" + setupID);

	setupDiv.appendChild(setupListDiv);
	//add the br
	var br = document.createElement("BR");
	setupDiv.appendChild(br);
	//add the save button for the setup
	var saveSetupButton = document.createElement("INPUT");
	saveSetupButton.setAttribute("id", "saveSetup" + setupID);
	saveSetupButton.setAttribute("type", "button");
	saveSetupButton.setAttribute("value", "Save");
	saveSetupButton.addEventListener("click", saveSetup);
	setupDiv.appendChild(saveSetupButton);

	var deleteSetupButton = document.createElement("INPUT");
	deleteSetupButton.setAttribute("id", "deleteSetup" + setupID);
	deleteSetupButton.setAttribute("type", "button");
	deleteSetupButton.setAttribute("value", "Delete");
	deleteSetupButton.addEventListener("click", deleteSetup);
	setupDiv.appendChild(deleteSetupButton);

	var setupStateDiv = document.createElement("DIV");
	setupStateDiv.setAttribute("id", "setupStateMsg" + setupID);
	setupDiv.appendChild(setupStateDiv);

	//adding the windows for the current WebsiteSetup object.
	for(var j=0; j<webSetup.windows.length;j++){
		//create a new window, function will add the add window or delete window buttons
		var currentWindow = addWindow(setupID);
		/*
		 * FILL IN THE WINDOW POSITIONS
		 */
		//need to get window positions
		document.getElementById("windowTop" + (windowIdCount-1)).value = webSetup.windows[j].top;
		document.getElementById("windowLeft" + (windowIdCount-1)).value = webSetup.windows[j].left;
		document.getElementById("windowHeight" + (windowIdCount-1)).value = webSetup.windows[j].height;
		document.getElementById("windowWidth" + (windowIdCount-1)).value = webSetup.windows[j].width;
		document.getElementById("windowMaximized" + (windowIdCount-1)).value = webSetup.windows[j].isMaximized;



		var currentDL = currentWindow.getElementsByTagName("DL")[0];
		//create new url inputs for each in the window
		for(var k=0; k<webSetup.windows[j].tabs.length; k++){

			var urlName = webSetup.windows[j].tabs[k].url;
			if(k == 0){
				currentDL.appendChild(createUrlSection(1, tabIdCount++, urlName));
			}
			else{
				currentDL.appendChild(createUrlSection(0, tabIdCount++, urlName));
			}
		}
        fixFirstURL(currentDL.getElementsByTagName("DD"));
	}

    if(EXISTS){
        mainDiv.removeChild(mainDiv.getElementsByClassName('setup')[position]);
    }
}

function cleanAddNewSetup(setup , setupID){
	//clear name
	var name = document.getElementById("setupName" + setupID).value = '';
	//clear windows
	var tempWindows = setup.getElementsByClassName("window");

	var windowParent = tempWindows[0].parentNode;
	var tabParent;
	for(var i=0; i<tempWindows.length; i++){
		if(i == 0){//keep first window, just clean it up
			var tempTabs = tempWindows[i].getElementsByTagName("DD");
			tabParent = tempTabs[0].parentNode;
			for(var j=0; j<tempTabs.length; j++){
				if(j == 0){//keep first tab, just clean it up
					tempTabs[j].getElementsByClassName("urlInput")[0].value = '';
				}
				else{
					tabParent.removeChild(tempTabs[j]);
					j--;
				}
			}
		}
		else{
			windowParent.removeChild(tempWindows[i]);
			i--;
		}
	}
}

function loadExistingSetups(){
	var savedWebSetupsString = null;
	//var savedWebSetupsList = [];

	chrome.storage.sync.get(["webSetupsList"], function(items){

		if(items == null || items.webSetupsList == null){
			return;
		}
		//items.webSetupsList is parsed already when it is saved, so we should turn it back into an object.
		savedWebSetupsString = items.webSetupsList

		var tempWebsiteSetup = null;
		//put all the objects into a list
		for(i=0; i<savedWebSetupsString.length; i++){
			tempWebsiteSetup = JSON.parse(savedWebSetupsString[i]);
			updateModifySetupList(tempWebsiteSetup);
		}
	});
}

function createNameSection(name, setupID){
	var nameDiv = document.createElement("DIV");
	nameDiv.setAttribute("id", "setupNameInput" + setupID);
	//adding name
	//<label for="setupName1">Name:</label>
	var nameText = document.createElement("Label");
    nameText.setAttribute("for", "setupName" + setupID);
    nameText.innerHTML = "Name: ";
    nameDiv.appendChild(nameText);

	var nameLabel = document.createElement("INPUT");
	nameLabel.setAttribute("id", "setupName" + setupID);
	nameLabel.setAttribute("class", "name");
	nameLabel.setAttribute("name", "setupName");
	nameLabel.setAttribute("type", "text");
	nameLabel.setAttribute("size", "14");
	nameLabel.setAttribute("value", name);
	nameDiv.appendChild(nameLabel);
	//hide the saved name for the setup so that we can correct it
	var nameHiddenInput = document.createElement("INPUT");
	nameHiddenInput.setAttribute("id", "setupNameHiddenName" + setupID);
	nameHiddenInput.setAttribute("type", "hidden");
	nameHiddenInput.setAttribute("value", name);
	nameDiv.appendChild(nameHiddenInput);
	//adding name div for checkmark/x for valid name or error messages possibly
	var validDiv = document.createElement("DIV");
	validDiv.setAttribute("id", "setupNameValid" + setupID);
	nameDiv.appendChild(validDiv);

	var checkBox =document.createElement("INPUT");
	checkBox.setAttribute("id", "RemovePreviousWindows" + setupID);
	checkBox.setAttribute("type", "checkbox");
	checkBox.setAttribute("value", "RemovePreviousWindows");
	checkBox.setAttribute("checked", true);
	nameDiv.appendChild(checkBox);

	var labelForCheckBox =document.createElement("LABEL");
	labelForCheckBox.setAttribute("id", "RemovePreviousWindowsLabel" + setupID);
	labelForCheckBox.setAttribute("for", "RemovePreviousWindows" + setupID);
	labelForCheckBox.innerHTML = "Remove all current windows";
	nameDiv.appendChild(labelForCheckBox);


	return nameDiv;
}


var DRAGLOCK = false;
var dragElementTagName = '';
var dragSrcElement = null;

function handleDragStart(e) {
	if(!DRAGLOCK){
		DRAGLOCK = true;
		dragElementTagName = this.tagName;
		this.style.opacity = '0.4';

        dragSrcElement = this;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
	}
}

function handleDragEnd(e) {
	DRAGLOCK = false;
	dragElementTagName = '';
    this.style.opacity = '1.0';
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }
    this.classList.remove('over');

    if (dragSrcElement != this) {

        dragSrcElementParent = dragSrcElement.parentNode;


        if (dragSrcElement.tagName == 'DIV' && this.tagName == 'DD') { // don't swap window into dd
            return false;
        }
        else {
            if (dragSrcElement.tagName == 'DD' && this.tagName == 'DIV') { //place dd at end of window url

                this.getElementsByTagName('DL')[0].appendChild(dragSrcElement);

                var urlButtons = dragSrcElement.getElementsByTagName('input');

                if(urlButtons.length >= 3 && urlButtons[urlButtons.length - 1].value == "(+) add URL"){
                    urlButtons[urlButtons.length - 2].classList.remove('onlyOne');
                    dragSrcElement.removeChild(urlButtons[urlButtons.length - 1]);
                    dragSrcElement.removeChild(this.getElementsByTagName('span')[0]);
                }

            }
            else if (dragSrcElement.tagName == 'DD' && this.tagName == 'DD') { //place new dd in spot and move old down 1
                this.parentNode.parentNode.getElementsByTagName('DL')[0].insertBefore(dragSrcElement, this);

                var urlButtons = this.getElementsByTagName('input');

                if(urlButtons.length >= 3 && urlButtons[urlButtons.length - 1].value == "(+) add URL"){
                    urlButtons[urlButtons.length - 2].classList.remove('onlyOne');
                    this.removeChild(urlButtons[urlButtons.length - 1]);
                    this.removeChild(this.getElementsByTagName('span')[0]);

                    var newFirstUrlButtons = dragSrcElement.getElementsByTagName('input');

                    if(newFirstUrlButtons.length < 3){
                        var tabIDNumber = parseInt(newFirstUrlButtons[0].id.slice("setupURL".length));

                        var tempAddButton = document.createElement("INPUT");
                        tempAddButton.setAttribute("type", "button");
                        tempAddButton.setAttribute("id", "addUrlButton" + tabIDNumber);
                        tempAddButton.setAttribute("value", "(+) add URL");
                        tempAddButton.setAttribute("class", "urlButton");
                        tempAddButton.addEventListener("click", addUrl);

                        var tempErrorDiv = document.createElement("SPAN");
                        tempErrorDiv.setAttribute("id", "windowURLErrorMsg" + tabIDNumber);

                        dragSrcElement.appendChild(tempAddButton);
                        dragSrcElement.appendChild(tempErrorDiv);
                    }
                }
                else{

                    var urlButtons = dragSrcElement.getElementsByTagName('input');

                    if(urlButtons.length >= 3 && urlButtons[urlButtons.length - 1].value == "(+) add URL"){
                        urlButtons[urlButtons.length - 2].classList.remove('onlyOne');
                        dragSrcElement.removeChild(urlButtons[urlButtons.length - 1]);
                        dragSrcElement.removeChild(this.getElementsByTagName('span')[0]);
                    }
                }

            }
            else if (dragSrcElement.tagName == 'DIV' && this.tagName == 'DIV') { //place window in new spot
                //check if target div is a window or setup, so we can decide where to put it
                if (this.className == 'setup') {//is setup, so add window at bottom
                    var tempSetup = this.getElementsByTagName('DIV')[2];
                    var tempButton = tempSetup.getElementsByTagName('INPUT');
                    var tempButton = tempButton[tempButton.length - 1];

                    tempSetup.insertBefore(dragSrcElement, tempButton);
                }
                else {//window place before window
                    this.parentNode.insertBefore(dragSrcElement, this);
                }

                fixFirstWindow(this.parentNode);

                if (dragSrcElement != this.parentNode.getElementsByClassName('window'[0])) {
                    var deleteButton = dragSrcElement.getElementsByTagName('input')[5];
                    deleteButton.classList.remove('onlyOne');

                }

                dragSrcElementParent = dragSrcElementParent.parentNode;
            }
            //cleanup
            cleanupSetups(dragSrcElementParent);
        }
    }

    return false;
}

function cleanupSetups(dragSrcElementParent) {

    if (dragSrcElementParent.tagName == 'DL') { //check if dd list is empty if so remove window

        var ddList = dragSrcElementParent.getElementsByTagName('DD');

        if (ddList.length < 1) {

            //add a new dd spot if window1

            var tempWindow = dragSrcElementParent.parentNode;

            if (tempWindow.parentNode.id == 'setupList1') { //add new dd
                dragSrcElementParent.appendChild(createUrlSection(1, tabIdCount++, ''));
            }
            else{ // check if window should be deleted
                cleanupSetups(tempWindow);
            }
        }
    }
    else if (dragSrcElementParent.className == 'setup') {


        var windowList = dragSrcElementParent.getElementsByClassName('window');


        if (windowList.length < 1) {

            if (dragSrcElementParent.id == 'setup1') { //add new window


                document.getElementById('addWindowButton1').remove();

                addWindow(1).getElementsByTagName("DL")[0].appendChild(createUrlSection(1, tabIdCount++, ''));

            }
            else{

                //TODO: NEED TO DELETE SETUP
                var setup = dragSrcElementParent;
                var parent = setup.parentNode;
                var id = setup.id.slice("setup".length);
                var name = document.getElementById("setupNameHiddenName" + id).value;

                parent.removeChild(setup);

                parent.remove
                chrome.storage.sync.get(["webSetupsList"], function(items){

                    var savedWebSetupsList = items.webSetupsList;

                    for(var i=0; i<savedWebSetupsList.length; i++){
                        var storedName = JSON.parse(savedWebSetupsList[i]).name;
                        if(storedName == name){
                            savedWebSetupsList.splice(i, 1);
                            break;
                        }
                    }
                    //saving the new list of setups by deleting this one.
                    chrome.storage.sync.set({'webSetupsList': savedWebSetupsList}, function(){
                        //message('Settings saved');
                    });

                });
            }
        }
    }
    else if (dragSrcElementParent.tagName == 'DIV') { //check if window list is empty


        var ddList = dragSrcElementParent.getElementsByTagName('DD');

        if (ddList.length < 1) {
            //add a new dd spot if window1

            var tempSetup = dragSrcElementParent.parentNode;

            tempSetup.removeChild(dragSrcElementParent);

            cleanupSetups(tempSetup.parentNode);
        }
    }
}

function handleDragOver(e) {

	if(DRAGLOCK) {
		if (e.preventDefault) {
			e.preventDefault();
		}

		e.dataTransfer.dropEffect = 'move';
	}
	return false;
}

function handleDragEnter(e) {

	if (DRAGLOCK && this.tagName == dragElementTagName || (dragElementTagName == 'DD' && this.className != 'setup')){
		this.classList.add('over');
	}

}

function handleDragLeave(e) {

	if(DRAGLOCK) {
		this.classList.remove('over');
	}
}
