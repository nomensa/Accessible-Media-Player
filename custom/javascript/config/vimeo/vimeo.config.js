/**
*    The Nomensa accessible media player is a flexible multimedia solution for websites and intranets.  
*    The core player consists of JavaScript wrapper responsible for generating an accessible HTML toolbar 
*    for interacting with a media player of your choice. We currently provide support for YouTube (default),
*    Vimeo and JWPlayer although it should be possible to integrate the player with almost any media player on
*    the web (provided a JavaScript api for the player in question is available).
*    
*    Copyright (C) 2012  Nomensa Ltd
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

/*
* Config file for using vimeo with the nomensa mediaplayer
* In order to override the required player methods this needs to 
* be passed into the mediaplayer constructor as the second argument
*-------------------------------------------------------------------------------------*/
var vimeoconfig = {	
	/*
	* Init method for our player instance.  This is where we can bind 
	* our custom callback events to ensure correct operation of the player
	* @param player {object}: an instance of the player manager class. 
	*-------------------------------*/
	init : function(player){
		// Get a reference to this
		var self = this;
		// Add the player manager instance to the player
		this.player = player;
		// If the repeat option is set to true set the video to loop
		if (this.config.repeat) {
			this.player.api_setLoop(true);
		}
		// Add an event listner required for updating the loaded portion of the slider bar
		this.player.api_addEventListener('loadProgress', 'vimeo_player_loadProgress');
		// Add an event listener required for setting the timeout for the slider bar/captions when the native play button is used
		this.player.api_addEventListener('play', 'vimeo_player_play');
		// Add an event listener required for clearing the timeout for the slider bar/captions when the native pause button is used
		this.player.api_addEventListener('pause', 'vimeo_player_pause');
	},
	getFlashParams : function(){return {allowScriptAccess: "always",wmode: 'transparent', 'flashvars' : 'api=1'};},
	getURL : function(){return this.config.url+this.config.media+'&player_id='+this.config.id;},
	play : function(){this.player.api_play();this.setSliderTimeout();if(this.config.captionsOn && this.captions){this.setCaptionTimeout();}},
	pause : function(){this.player.api_pause();this.clearSliderTimeout();if(this.config.captionsOn && this.captions){this.clearCaptionTimeout();}},
	// TODO: We are simply setting the volume to full on unmute - Fix this
	mute : function(){var $button = this.$html.find('button.mute');if($button.hasClass('muted')){$button.removeClass('muted');this.player.api_setVolume(1);}else{$button.addClass('muted');this.player.api_setVolume(0);}},
	getDuration : function(){return this.player.api_getDuration();},
	getCurrentTime : function(){return this.player.api_getCurrentTime();},
	getBytesLoaded : function(){if(this.bytesLoaded){return this.bytesLoaded;}else{return 0;}},
	getBytesTotal : function(){if(this.bytesTotal){return this.bytesTotal;}else{return 0;}},	// The getBuffer() call (above) returns the buffered value as a percentage.  Therefore total bytes is 100
	seek : function(time){this.player.api_seekTo(time);if(this.config.captionsOn && this.captions){this.$html.find('.caption').remove();this.clearCaptionTimeout();this.getPreviousCaption(time);this.setCaptionTimeout();}},
	volup : function(){var vol = parseInt((this.player.api_getVolume() * 100), 10);if(vol < (100 - this.config.volume_step)){vol += this.config.volume_step;}else{vol = 100;}this.updateVolume(vol);vol = vol/100;this.player.api_setVolume(vol);},
	voldwn : function(){var vol = parseInt((this.player.api_getVolume() * 100), 10);if(vol > (this.config.volume_step)){vol -= this.config.volume_step;}else{vol = 0;}this.updateVolume(vol);vol = vol/100;this.player.api_setVolume(vol);},
	cue : function(){return;}
};

/*
* Event listener for when the vimeo player has loaded.  This is used to initialise the player
* and merge the player interface into the player object
* @param player_id {string}: The id of the flash player (used for retrieving the player from the 
* PlayerDaemon and getting a reference to the object instance from the DOM).
*-------------------------------------------------------------------------------------------*/
function vimeo_player_loaded(player_id){
	var player = PlayerDaemon.getPlayer(player_id);
	var myplayer = document.getElementById(player_id);
	player.init(myplayer);
}

/*
* Apparently Vimeo want us to provide a listener for getting the load progress of the video 
* The event listener has been registered within the init call (above).  Bit of a fudge, but 
* Best we can do with the api as it currently stands
* @param args {object}: map of info about the number of bytes loaded/bytes total etc
* @param player_id {string}: The id of the player
*-------------------------------------------------------------------------------------------*/
function vimeo_player_loadProgress(args, player_id){
	var player = PlayerDaemon.getPlayer(player_id);
	player.bytesLoaded = args.bytesLoaded;
	player.bytesTotal = args.bytesTotal;
}

/*
* Callback function for when the video is played using the native play button
* This is used to sync the slider bar timeout etc.
* @param player_id {string}: the id of the player
*-------------------------------------------------------------------------------------------*/
function vimeo_player_play(player_id){
	var player = PlayerDaemon.getPlayer(player_id);
	player.setSliderTimeout();
	if(player.config.buttons.toggle){	// This seems pretty bad.  Can we not abstract this sort of logic further?
		player.$html.find('.play').removeClass('play').addClass('pause').text('Pause');
	}
	// If captioning is turned on, reset the timeout
	if(player.config.captionsOn && player.captions){
		player.setCaptionTimeout();
	}
}

/*
* Callback function for when the video is paused using the native pause button
* This is used to clear the timeout for the slider bar and captions.
* @param player_id {string}: the id of the player
*-------------------------------------------------------------------------------------------*/
function vimeo_player_pause(player_id){
	var player = PlayerDaemon.getPlayer(player_id);
	player.clearSliderTimeout();
	if(player.config.buttons.toggle){	// This seems pretty bad.  Can we not abstract this sort of logic further?
		player.$html.find('.pause').removeClass('pause').addClass('play').text('Play');
	}
	// If captioning is turned on, clear the timeout
	if(player.config.captionsOn && player.captions){
		player.clearCaptionTimeout();
	}
}