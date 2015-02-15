/* OBJECTS */
function WebsiteSetup(name){
	this.name = name;
	this.windows = [];
	this.removePrevWindows = true;
}

function WebsiteWindow(){
	this.tabs = [];
	
	this.positionUsed = false;
	this.isMaximized = true;
	
	this.top = null;
	this.left = null;
	this.height = null;
	this.width = null;
}

function WebsiteWindow(top, left, height, width, isMaximized){
	this.tabs = [];
	
	this.positionUsed = true;
	this.isMaximized = isMaximized;
	
	this.top = top;
	this.left = left;
	this.height = height;
	this.width = width;
}



function WebsiteTab(url){
	this.url = url;
}