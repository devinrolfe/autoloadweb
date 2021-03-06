var chrome_extension_id = null;

var windowId = null;
var listOfWindowIds = []


var removeAll = false;
var prevWindows = null;

// Run our extension script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    console.log("Started autoloadWeb_Main");
    autoloadWebObject.loadSavedChoices_();

    if (isDevMode()) {
        chrome_extension_id = ChromeExtensionID.LOCAL;
    } else {
        chrome_extension_id = ChromeExtensionID.STORE;
    }

    //chrome.storage.sync.clear();
    //chrome.storage.sync.set({'curSetupName': ''}, function(){
    //});
});

var autoloadWebObject = {

	loadSavedChoices_: function(){
		//load saved values, then call displayOptions
		//display options will take in a list of the saved values
		chrome.storage.sync.get(["webSetupsList"], function(items){

			var websiteSetup = [];

			if(!(items == null || items.webSetupsList == null)){
				var savedWebSetupsString = items.webSetupsList
				//put all the objects into a list
				for(var i=0; i<savedWebSetupsString.length; i++){
					websiteSetup.push(JSON.parse(savedWebSetupsString[i]).name);
				}
			}
			autoloadWebObject.displayOptions_(websiteSetup);
		});
	},

	displayOptions_: function(websiteChoice){
		var table = document.createElement("TABLE");
		table.setAttribute("id", "autoloadWebTable");
		document.body.appendChild(table);

		for(var i=0; i < websiteChoice.length; i++){
			var tempTR= document.createElement("TR");
			tempTR.setAttribute("id", "row" + i);
			table.appendChild(tempTR);


            var tdSetup = document.createElement("TD");
            tdSetup.setAttribute("colspan", "3");
            tempTR.appendChild(tdSetup);

			var tempButton = document.createElement("INPUT");
			tempButton.setAttribute("type", "button");
			tempButton.setAttribute("name", "row" + i);
			tempButton.setAttribute("id", "row" + i);
			tempButton.setAttribute("value", websiteChoice[i]);
			tempButton.addEventListener("click", loadSetup);
			tdSetup.appendChild(tempButton);
		}
		//create option buttons, should be 2 option buttons
		//1. save current set up
		//3. Options - create/modify setups
		var optionsRow = document.createElement("TR");
		optionsRow.setAttribute("id", "optionRow");
		table.appendChild(optionsRow);
		//1.
        var quickSaveTD = document.createElement("TD");
        var quickSaveButton = document.createElement("INPUT");
        quickSaveButton.setAttribute("type", "button");
        quickSaveButton.setAttribute("name", "quickSaveOption");
        quickSaveButton.setAttribute("id", "quickSaveOption");
        quickSaveButton.setAttribute("value", "Quick Save");

        quickSaveButton.addEventListener("click", quickSaveFunction);
        quickSaveTD.appendChild(quickSaveButton);
        optionsRow.appendChild(quickSaveTD);

        //2.
        var option1 = document.createElement("TD");
        var option1Button = document.createElement("INPUT");
        option1Button.setAttribute("type", "button");
        option1Button.setAttribute("name", "option1");
        option1Button.setAttribute("id", "option1");
        option1Button.setAttribute("value", "Save Current Setup");
        option1Button.addEventListener("click", saveCurrentSetUp);
        option1.appendChild(option1Button);
        optionsRow.appendChild(option1);

		//3.
		var options = document.createElement("TD");
		var optionsButton = document.createElement("INPUT");
		optionsButton.setAttribute("type", "button");
		optionsButton.setAttribute("name", "options");
		optionsButton.setAttribute("id", "options");
		optionsButton.setAttribute("value", "Options");
		options.appendChild(optionsButton);
		optionsRow.appendChild(options);
		optionsButton.addEventListener("click", optionsFunction);
	}

};
function loadSetup(){
	var name = this.value;

    //new
    chrome.storage.sync.set({'curSetupName': name}, function(){

        chrome.storage.sync.get(["webSetupsList"], function(items){

            if(items == null || items.webSetupsList == null){
                return;
            }
            //items.webSetupsList is parsed already when it is saved, so we should turn it back into an object.
            var savedWebChoicesString = items.webSetupsList;

            var websiteChoice = null;
            //put all the objects into a list
            for(var i=0; i<savedWebChoicesString.length; i++){
                if(name == JSON.parse(savedWebChoicesString[i]).name){
                    websiteChoice = JSON.parse(savedWebChoicesString[i]);
                    break;
                }
            }
            if(websiteChoice == null){
                return;
            }
            //check if the remove all previous windows is set, if so remove all current windows.
            if(websiteChoice.removePrevWindows){
                chrome.windows.getAll({populate:true},
                    function(windows){
                        //collect all the windows and remove them.
                        windows.forEach(function(window){
                            //chrome.windows.remove(window.id);
                            listOfWindowIds.push(window.id);
                        });
                    });
            }
            else{
                removeAll = false;
            }

            for (var i = 0; i < websiteChoice.windows.length; i++) {
                if (i == 0 && i == websiteChoice.windows.length - 1) {
                    loadWindow(websiteChoice.windows[i], true, true);
                }
                else if (i == 0) {
                    loadWindow(websiteChoice.windows[i], true, false);
                }
                else if (i == websiteChoice.windows.length - 1) {
                    loadWindow(websiteChoice.windows[i], false, true);
                }
                else {
                    loadWindow(websiteChoice.windows[i], false, false);
                }
            }
        });
    });
}

function loadWindow(window, focus, lastWindow){
	var tempUrl = checkUrl(window.tabs[0].url);

	//var tempUrl = window.tabs[0].url;
	chrome.windows.create(
			{'url':tempUrl, 'focused': false, 'top': window.top, 'left': window.left, 'height': window.height, 'width': window.width},
			function(chromeWindow){


				if(focus){windowId = chromeWindow.id;};

				for(var i=1; i<window.tabs.length; i++){
					tempUrl = checkUrl(window.tabs[i].url);
					//tempUrl = window.tabs[i].url;

					chrome.tabs.create(
							{'windowId':chromeWindow.id, 'url':tempUrl, 'active':false, 'selected':false},
							function(chromeTab){
								//nothing to do with the tab at the moment.
							}
					);
				}

				if(window.isMaximized){
					chrome.windows.update(chromeWindow.id, {state:'maximized'});
				}

                if(lastWindow){

                    while(listOfWindowIds.length > 0){
                        var tempWindowId = listOfWindowIds.pop();
                        chrome.windows.remove(tempWindowId);
                    }



                    chrome.windows.update(windowId, {focused: true});

                }
			}
	);
}

function checkUrl(tempUrl){
	//need to parse the first characters in url to see if match
	//1. https://www
    //2. http://www
    //3. www
	var pattern1 = /https:\/\/www\./;
	var pattern2 = /http:\/\/www\./;
	var pattern3 = /www\./;
    var pattern4 = /http:\/\//;
    var pattern5 = /https:\/\//;
    var pattern6 = /chrome-extension:\/\//;

	if(pattern1.test(tempUrl) ||
       pattern2.test(tempUrl) ||
       pattern4.test(tempUrl) ||
       pattern5.test(tempUrl) ||
       pattern6.test(tempUrl)){
		//done nothing to url since it is in good from
	}
	else if(pattern3.test(tempUrl)){
		tempUrl = "http://" + tempUrl;
	}
	else{
        tempUrl = "http://www." + tempUrl;
	}
	return tempUrl;
}

function saveCurrentSetUp(){
    console.log("Starting saveCurrentSetup");
	chrome.windows.getAll({populate:true},
		function(windows){

		var webSetup = new WebsiteSetup("setup not given a name.");
			//collect all the windows and respective tabs.
			windows.forEach(function(window){
				var webWindow;

				if(window.state == "maximized"){

					webWindow = new WebsiteWindow(window.top, window.left, window.height, window.width, true);
				}
				else{
					webWindow = new WebsiteWindow(window.top, window.left, window.height, window.width, false);
				}
				window.tabs.forEach(function(tab){
					if(tab.url != "chrome-extension://" + chrome_extension_id + "/options.html"){
						var webTab = new WebsiteTab(tab.url);
						webWindow.tabs.push(webTab);
					}
				});
				webSetup.windows.push(webWindow);
			});
			//save the setup.
			chrome.storage.sync.set({'lastSavedWebSetup': JSON.stringify(webSetup)}, function(){
				//message('Settings saved');
			});

			var w = 420;
		    var h = 200;
		    var left = (screen.width/2)-(w/2);
		    var top = (screen.height/2)-(h/2);

			chrome.windows.create(
				{'url': '/src/view/setupPrompt.html', 'type': 'popup', 'width': w,
				'height': h, 'left': left, 'top': top, 'focused': true}, function(){
                    this.close();
                });
	});

}


/*
 * makes it so that only one option tab is open at a time
 */
function optionsFunction(){
	//NOTE: Only one option tab can be open at a time, so if one option tab is opened in another
	//window then it will be moved to the current window.

	//this will open the options.html, but will first check if the tab is already open
	chrome.tabs.query({url: "chrome-extension://" + chrome_extension_id + "/options.html"},
			function(array_of_Tabs){
				var tab = array_of_Tabs[0];
				if(tab != null){

					chrome.windows.getCurrent(
						function(window){
							chrome.tabs.move(tab.id, {windowId: window.id, index: -1},
									function(optionTab){
										chrome.tabs.update(tab.id, {selected: true});
									});
						});
				}
				else{
					chrome.tabs.create({url: "/src/view/options.html"});
				}
			});
}
/**
 * quickly saves the setup from the last setup loaded
 */
function quickSaveFunction(){

    chrome.storage.sync.get(["curSetupName"], function(items){

        var quickSaveButton = document.getElementById('quickSaveOption');

        if(items == null || items.curSetupName == null || items.curSetupName == ''){
            quickSaveButton.classList.add('noQuickSave');

            setTimeout(function(){
                quickSaveButton.classList.remove('noQuickSave');
            }, 1000 );

            saveCurrentSetUp();
        }
        else{
            var curSetupName = items.curSetupName;

            quickSaveButton.classList.add('yesQuickSave');

            setTimeout(function(){
                quickSaveButton.classList.remove('yesQuickSave');
            }, 1000 );

            chrome.windows.getAll({populate:true},
                function(windows){

                    var webSetup = new WebsiteSetup(curSetupName);
                    //collect all the windows and respective tabs.
                    windows.forEach(function(window){
                        var webWindow;

                        if(window.state == "maximized"){

                            webWindow = new WebsiteWindow(window.top, window.left, window.height, window.width, true);
                        }
                        else{
                            webWindow = new WebsiteWindow(window.top, window.left, window.height, window.width, false);
                        }
                        //oonpekkcdidfjkfkmcokdlmanefiocle LOCAL
                        //mifafbjbnhpmdjngkhnmfjdlefdgileh STORE
                        window.tabs.forEach(function(tab){
                            if(tab.url != "chrome-extension://oonpekkcdidfjkfkmcokdlmanefiocle/options.html"){
                                var webTab = new WebsiteTab(tab.url);
                                webWindow.tabs.push(webTab);
                            }
                        });
                        webSetup.windows.push(webWindow);

                    });

                    //Quick save the setup
                    chrome.storage.sync.get(["webSetupsList"], function(items){

                        var savedWebSetupsList = null;
                        var name = curSetupName;

                        var boolReturn = 0;
                        var overWrite = -1;

                        //items.webSetupsList is parsed already when it is saved, so we should turn it back into an object.
                        savedWebSetupsList = items.webSetupsList

                        for(var i=0; i<savedWebSetupsList.length; i++){
                            var storedName = JSON.parse(savedWebSetupsList[i]).name;
                            if(storedName == name) {
                                overWrite = i;
                                webSetup.removePrevWindows = JSON.parse(savedWebSetupsList[i]).removePrevWindows;
                                boolReturn = 0;
                                break;
                            }
                            else{
                                boolReturn = 1;
                            }
                        }

                        //if something weird happen, just show error highlight
                        if(boolReturn){
                            quickSaveButton.classList.add('noQuickSave');

                            setTimeout(function(){
                                quickSaveButton.classList.remove('noQuickSave');
                            }, 1000 );

                            return;
                        }
                        else{
                            savedWebSetupsList[overWrite] = JSON.stringify(webSetup);

                            //saving quick save
                            chrome.storage.sync.set({'webSetupsList': savedWebSetupsList},
                                function(){
                                    //message('Settings saved');
                                    //this will open the options.html, but will first check if the tab is already open
                                    chrome.tabs.query({url: "chrome-extension://" + chrome_extension_id + "/options.html"},
                                        function(array_of_Tabs){
                                            var tab = array_of_Tabs[0];
                                            if(tab != null){
                                                //send message to options tab to update the list
                                                //of setups
                                                chrome.runtime.sendMessage(
                                                    {greeting: "update",
                                                        payload: JSON.stringify(webSetup),
                                                        exists: true});
                                            }
                                        });
                                });
                        }
                    });
                });
        }
    });
}



/*
 * Closes the chrome extension pop-up.
 * This method is useful when a setup is chosen, but it does not close all previous windows.
 */
function closeExtension(){
	self.close();
}
