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