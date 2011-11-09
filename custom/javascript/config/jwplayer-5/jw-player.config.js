/*
* Config file for using jwplayer with the nomensa mediaplayer
* In order to override the required player methods this needs to 
* be passed into the mediaplayer constructor as the second argument
*
* @example: $('#myplayer').player({},jwconfig);
* 
* Note that the first argument in this instance is empty.  This first argument 
* maps to the config so any basic properties that need to be overridden can be 
* done so via this object
* 
* @example: $('#myplayer').player({id:'jwplayer',buttons:{toggle:false}},jwconfig);
* 
* This example will use the jwconfig, will set the basic id to 'jwplayer' and will 
* remove the play/pause toggle.  Both play and pause buttons will be provided instead 
* of just the one button for toggling between play and pause
* 
* @dependencies: 
*     - jwplayer version 5.x - Tested with version 5.6
*     - jwplayer.js. (This file is needed to create the player manager instance.
*       it should be distributed with the jwplayer package)
*     - jquery.js (Versions 1.3.2 - current)
*     - jquery.ui.js (Versions 1.7.3/1.8.13 currently supported)
*-------------------------------------------------------------------------------------*/
var jwconfig = {	
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
		// Cue the player
		this.cue();
		// When the player is played, this method is called
		this.player.onPlay(function(e){
			self.setSliderTimeout();
			if(self.config.buttons.toggle){	// This seems pretty bad.  Can we not abstract this sort of logic further?
				self.$html.find('.play').removeClass('play').addClass('pause').text('Pause');
			}
			// If captioning is turned on, reset the timeout
			if(self.config.captionsOn && self.captions){
				self.setCaptionTimeout();
			}
		});
		// When the player is paused, this method is called
		this.player.onPause(function(e){
			self.clearSliderTimeout();
			if(self.config.buttons.toggle){	// This seems pretty bad.  Can we not abstract this sort of logic further?
				self.$html.find('.pause').removeClass('pause').addClass('play').text('Play');
			}
			// If captioning is turned on, clear the timeout
			if(self.config.captionsOn && self.captions){
				self.clearCaptionTimeout();
			}
		});
		// If the movie is repeated, start playing it again when it finishes
		if(this.config.repeat === true){
			this.player.onComplete(function(e){
				self.play();
			});
		}
	},
	getURL : function(){return this.config.url;},
	play : function(){this.player.play();this.setSliderTimeout();if(this.config.captionsOn && this.captions){this.setCaptionTimeout();}},
	pause : function(){this.player.pause();this.clearSliderTimeout();if(this.config.captionsOn && this.captions){this.clearCaptionTimeout();}},
	mute : function(){var $button = this.$html.find('button.mute');this.player.setMute();if($button.hasClass('muted')){$button.removeClass('muted');}else{$button.addClass('muted');}},
	getCurrentTime : function(){return this.player.getPosition();},
	getBytesLoaded : function(){return this.player.getBuffer();},
	getBytesTotal : function(){return 100;},	// The getBuffer() call (above) returns the buffered value as a percentage.  Therefore total bytes is 100
	seek : function(time){this.player.seek(time);if(this.config.captionsOn && this.captions){this.$html.find('.caption').remove();this.clearCaptionTimeout();this.getPreviousCaption(time);this.setCaptionTimeout();}},
	cue : function(){return;}
};

function jwPlayerReady(obj) {
	var id = $(obj.ref).attr('id');	// Unsure why but jwplayer callback prefixes the id with 'player'. 
									// Instead we'll just extract the id from a jQuery wrapped set of obj.ref
	var player = PlayerDaemon.getPlayer(id);
	var myplayer = jwplayer(obj.ref);	// We get the player manager instance by wrapping it in the jwplayer method
	player.init(myplayer);
}