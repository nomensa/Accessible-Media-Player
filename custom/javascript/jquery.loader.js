/*
* Nomensa Media Player
* http://player.nomensa.com
* 
* Copyright (c) 2011 Nomensa
* http://www.nomensa.com
*---------------------------------*/

$(document).ready(function() {
/*
 * There are many ways in which you can load the Accessible Media Player. The best method 
 * will vary depending on any implementation and/or CMS restrictions you might have.
 */
    
	/*
	 * OR you could do a jQuery lookup for specific links/file types
	 * (simple but potentially less flexible and extra load on the browser)
	 */
	var $yt_links = $("a[href*='http://www.youtube.com/watch']");
    var $media_links = $("a[href$='flv'], a[href$='mp4'], a[href$='ogv']");
    var $audio_links = $("a[href$='mp3']");
    
    // Create players for our youtube links
    $.each($yt_links, function(i) {
        var $holder = $('<span />');
        $(this).parent().replaceWith($holder);
        // Find the captions file if it exists
        var $mycaptions = $(this).siblings('.captions');
        // Work out if we have captions or not
        var captionsf = $($mycaptions).length > 0 ? $($mycaptions).attr('href') : null;
        // Ensure that we extract the last part of the youtube link (the video id)
        // and pass it to the player() method
        var link = $(this).attr('href').split("=")[1];
        // Initialise the player
        $holder.player({
            id:'yt'+i,
            media:link,
			captions:captionsf
        });
    });
    
    // Create players for our audio links
    $.each($audio_links, function(i) {
        var $holder = $('<span />');
        $(this).parent().replaceWith($holder);
        // Get the path/url tpo the audio file
        var link = $(this).attr('href');
        // Create an instance of the player 
        $holder.player({
            id:'audio'+i,
            media:link,
        	flashHeight: 50,
        	url: './custom/javascript/config/jwplayer-5/core/player.swf',
            playerWidth: '270px',
            swfCallback : jwPlayerReady
        }, jwconfig);
    });

    // Create players for our media links
    $.each($media_links, function(i) {
        var $holder = $('<span />');
        // Extract the url/path from the links href attribute
        var link = $(this).attr('href');
        // Grab the captions if they exist
		var $captions = $(this).siblings('.captions');
		// Work out if the video has captions
		var captionsFile = $($captions).length > 0 ? $($captions).attr('href') : '';
		$(this).parent().replaceWith($holder);
		// Instantiate the jwplayer
        $holder.player({
            id:'jw'+i,
            media:link,
			captions:captionsFile,
        	flashHeight: 300,
        	url: './custom/javascript/config/jwplayer-5/core/player.swf',
        	swfCallback : jwPlayerReady
        }, jwconfig);
    });

});