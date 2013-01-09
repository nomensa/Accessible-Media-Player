window.NOMENSA = window.NOMENSA || {};
window.NOMENSA.player = window.NOMENSA.player || {};
window.NOMENSA.player.MediaplayerDecorator = function (mediaplayer) {
  var player = mediaplayer;
  /**
   * The current 'mediaplayer' object requires all of the functions
   * to be accessible from a single point. This is a first stab at
   * unifying our interfaces to one place. The only reason this is
   * being done is so that we don't end up heavily refactoring the
   * library.
   */
  this.config = player.config;
  this.player = player.player;
  this.state = player.state;
  for (var method in player){
    if (typeof player[method] === "function"){
      this[method] = (function (mthd) {
        return function () {
          return player[mthd].apply(this, arguments);
        };
      } (method));
    }
  }
};

/*
 * Method for creating a container that
 * holds the media and the controls
 * @return {obj}: A jQuery wrapped set
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.generatePlayerContainer = function() {
  var $container = $('<' + this.config.playerContainer + ' />')
    .css(this.config.playerStyles)
    .addClass('player-container');
  if ($.browser.msie) {
    $container.addClass('player-container-ie player-container-ie-'
                        + $.browser.version.substring(0, 1));
  }

  return $container;
};
/*
 * Method for assembling the HTML for the media player
 * This is just a wrapper for a number of other method calls
 * Help us to organise our methods better
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.assembleHTML = function() {
  var $playerContainer = this.generatePlayerContainer();
  // generateVideoPlayer is specific to player type
  var $videoContainer = this.generateVideoPlayer($playerContainer);
  var $container = $videoContainer.append(this.getControls());
  return $container;
};
/*
 * Method for getting the url to embed the player
 * @return {string}: a url
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.getURL = function() {
  return [this.config.url, this.config.id].join('');
};
/*
 * Method for adding a button to a container
 * @param name {string}: the name of the button
 * @param action {string}: the action that the button will
 * trigger such as 'play', 'pause', 'ffwd' and 'rwd'.
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.createButton = function(action, name) {
  var $label = 0;
  var btnId = [action, this.config.id].join('-');

  var $btn = $('<button />')
    .append(name)
    .addClass(action)
    .attr({'title':action, 'id':btnId})
    .addClass('ui-corner-all ui-state-default')
    .hover(function() { $(this).addClass("ui-state-hover"); },
           function() { $(this).removeClass("ui-state-hover"); })
    .focus(function() { $(this).addClass("ui-state-focus"); })
    .blur(function() { $(this).removeClass("ui-state-focus"); })
    .click(function(e) { e.preventDefault(); });

  return $btn;
};
/*
 * Method for creating the functional controls such as
 * play, pause, rwd and ffwd buttons
 * @return {obj}: A jQuery wrapped set representing our
 * controls and container
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.getFuncControls = function() {
  var self = this;
  var $cont = $('<div>');
  $cont[0].className = 'player-controls';
  var buttons = [];

  // Create play/pause buttons.  If toggle is enabled one button performs both
  // play and pause functions.  Otherwise one button is provided for each
  if (self.config.buttons.toggle) { // If the toggle button is enabled
    var $toggle = self.createButton('play', 'Play')
      .attr({'aria-live': 'assertive'})
      .click(function() {
        if ($(this).hasClass('play')) {
          $(this).removeClass('play')
            .addClass('pause')
            .attr({'title': 'Pause', 'id': 'pause-' + self.config.id})
            .text('Pause');

          self.play();
        } else {
          $(this).removeClass('pause')
            .addClass('play')
            .attr({'title': 'Play', 'id': 'play-' + self.config.id})
            .text('Play');

          self.pause();
        }
      });
    buttons.push($toggle);
  } else {  // The toggle button is not enabled, so add play and pause buttons if enabled
    var $play = self.createButton('play', 'Play').click(function() { self.play(); });
    var $pause = self.createButton('pause', 'Pause').click(function() { self.pause(); });
    buttons.push($play);
    buttons.push($pause);
  }

  // If the rewind button is enabled
  if (self.config.buttons.rewind) {
    var $rwd = self.createButton('rewind', 'Rewind').click(function() { self.rewd(); });
    buttons.push($rwd);
  }
  // If the ffwd button is enabled
  if (self.config.buttons.forward) {
    var $ffwd = self.createButton('forward', 'Forward').click(function() { self.ffwd(); });
    buttons.push($ffwd);
  }

  // If captions is enabled and we have a captions file
  if (self.config.captions) {
    var $capt = self.createButton('captions', 'Captions').click(function() { self.toggleCaptions(); });
    var myClass = (self.config.captionsOn == true) ? 'captions-on' : 'captions-off';
    $capt.addClass(myClass);
    buttons.push($capt);
  }

  // Loop through our buttons adding each one to our container in turn
  for (var i = 0; i < buttons.length; i = i + 1) {
    $cont[0].appendChild(buttons[i][0]);
  }

  return $cont;
};
/*
 * Method for creating the volume controls such as
 * mute/unmute, Vol Up and Vol Down buttons
 * @return {obj}: A jQuery wrapped set representing our
 * volume controls and container
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.getVolControls = function() {
  var self = this;
  var $cont = $('<div>').addClass('volume-controls');
  var $mute = self.createButton('mute', 'Mute').click(function() { self.mute(); });
  var $up = self.createButton('vol-up', '+<span class="ui-helper-hidden-accessible"> Volume Up</span>')
    .click(function() { self.volup(); });
  var $dwn = self.createButton('vol-down','-<span class="ui-helper-hidden-accessible"> Volume Down</span>')
    .click(function() { self.voldwn(); });
  var $vol = $('<span />').attr({'id': 'vol-' + self.config.id, 'class': 'vol-display'})
    .text('100%');

  // Append all of our controls.  Doing it like this since
  // ie6 dies if we append recursively using native jQuery
  // append method
  var controls = [$mute, $dwn, $up, $vol];

  for (var i = 0; i < controls.length; i = i + 1) {
    $cont[0].appendChild(controls[i][0]);
  }

  return $cont;
};
/*
 * Method for getting the sliderbar for the media player
 * @return {obj}: A jQuery wrapped set, the sliderbar for
 * the media player
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.getSliderBar = function() {
  var $info = $('<span />').addClass('ui-helper-hidden-accessible')
    .html('<p>The timeline slider below uses WAI ARIA. Please use the documentation for your screen reader to find out more.</p>');
  var $curr_time = $('<span />').addClass('current-time')
    .attr({'id': 'current-' + this.config.id})
    .text('00:00:00');
  var $slider = this.getSlider();
  var $dur_time = $('<span />').addClass('duration-time')
    .attr({'id': 'duration-' + this.config.id})
    .text('00:00:00');
  var $bar = $('<div />').addClass('timer-bar').append($info);

  // Append all of our controls.  Doing it like this since
  // ie6 dies if we append recursively using native jQuery
  // append method
  var bits = [$curr_time, $slider, $dur_time];

  for (var i = 0; i < bits.length; i = i + 1) {
    $bar[0].appendChild(bits[i][0]);
  }

  return $bar;
};
/*
 * Method for creating the sliderbar for the media player
 * @return {obj}: A jQuery wrapped set, the sliderbar for
 * the media player
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.getSlider = function() {
  var self = this;
  var $sliderBar = $('<span />')
    .attr('id', 'slider-' + this.config.id)
    .slider({
      orientation: 'horizontal',
      change: function(event, ui) {
        // We're making use of the internal jQuery ui stuff here.
        // jQuery UI exposes a 'change' method of the slider widget
        // Allowing us to track state changes to the slider bar and respond
        // by queueing the video to the appropriate point
        var percentage = ui.value;
        var seconds = (percentage/100)*self.getDuration();
        self.seek(seconds);
      }
    });

  // Add our aria attributes to the sliderbar handle link
  $sliderBar.find('a.ui-slider-handle')
    .attr({
      'role': 'slider',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '0',
      'aria-valuetext': '0 percent',
      'title': 'Slider Control'
    });

  var $progressBar = $('<span />')
    .addClass('progress-bar')
    .attr({'id':'progress-bar-'+this.config.id, 'tabindex': '-1'})
    .addClass('ui-progressbar-value ui-widget-header ui-corner-left')
    .css({'width': '0%','height': '95%'});

  var $loadedBar = $('<span />')
    .attr({'id': 'loaded-bar-'+this.config.id, 'tabindex': '-1'})
    .addClass('loaded-bar ui-progressbar-value ui-widget-header ui-corner-left')
    .css({'height': '95%', 'width': '0%'});

  return $sliderBar.append($progressBar, $loadedBar);
};
/*
 * Method for setting the timeout function for updating the
 * position of the slider
 * @modifies {obj} this: Adds a reference to the timeout so that
 * it can be cleared easily further down the line
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.setSliderTimeout = function() {
  var self = this;
  if (self.sliderInterval == undefined) {
    self.sliderInterval = setInterval(function() {
      self.updateSlider();
    }, self.config.sliderTimeout);
  }
};
/*
 * Method for clearing the timeout function for updating the
 * position of the slider
 * @modifies {obj} this: Clears down the reference to the
 * timeout function
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.clearSliderTimeout = function() {
  var self = this;
  if (self.sliderInterval != undefined) {
    self.sliderInterval = clearInterval(self.sliderInterval);
  }
};
/*
 * Method for updating the position of the slider
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.updateSlider = function() {

  var duration = (typeof(this.duration) != 'undefined') ? this.duration : this.getDuration();
  var duration_found = (typeof(this.duration_found) == 'boolean') ? this.duration_found : false;
  var current_time = this.getCurrentTime();
  var markerPosition = 0;

  //get the correct value to set the marker to, converting time played to %
  if (duration > 0) {
    markerPosition = (current_time / duration) * 100;
    markerPosition = parseInt(markerPosition, 10);
  } else {  // Some players will return -1 for duration when the player is stopped.
    // This is not great so set duration to 0
    duration = 0;
  }

  // If the duration has not been found yet
  if (!duration_found) {
    $('#duration-' + this.config.id).html(this.formatTime(parseInt(duration, 10)));
    this.duration_found = true;
  }
  //Get a reference to the slider, find the slider handle and update the left value
  $('#slider-'+this.config.id)
    .find('a.ui-slider-handle')
    .attr({'aria-valuenow': markerPosition, 'aria-valuetext': markerPosition.toString() + ' percent'})
    .css('left', markerPosition.toString()+'%');

  //Get a reference to the progress bar and update accordingly
  $('#progress-bar-'+this.config.id)
    .attr({'aria-valuenow': markerPosition, 'aria-valuetext': markerPosition.toString() + ' percent'})
    .css('width', markerPosition.toString() + '%');

  // Update the loader bar
  this.updateLoaderBar();
  // Update the current time as shown to either side of the slider bar
  this.updateTime(current_time);
};
/*
 * Method for updating the loader bar
 * This has it's own method since loading occurs in the background
 * and may need to update whilst the video is not playing
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.updateLoaderBar = function() {
  // Work out how much of the video has loaded
  var loaded = (this.getBytesLoaded() / this.getBytesTotal()) * 100;
  // Ensure that we have an integer
  loaded = parseInt(loaded, 10);
  // If the value of 'loaded' is not finite it is not a number
  // so set the value of 'loaded' to 0
  if (!isFinite(loaded)) { loaded = 0; }
  //Get a reference to our loader bar and update accordingly
  $('#loaded-bar-' + this.config.id)
    .attr({'aria-valuetext': loaded.toString() + ' percent', 'aria-valuenow': loaded})
    .css('width', loaded.toString() + '%');
};
/*
 * Generic method for rendering a time string in the format "hh:mm:ss"
 * @param time {int}: time in seconds
 * @return {string}: A formatted time
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.formatTime = function(time) {
  var hours = 0;
  var minutes = 0;
  var seconds = 0;

  if (time >= 60) {        // If we have more than 60 seconds
    minutes = parseInt(time / 60, 10);
    seconds = time-(minutes * 60);
    if (minutes >= 60) { // If we have more than 60 minutes
      hours = parseInt(minutes / 60, 10);
      minutes -= parseInt(hours * 60, 10);
    }
  } else {        // The time is less than 60 seconds in length
    seconds = time;
  }

  var tmp = [hours, minutes, seconds];

  // Convert hours, minutes and seconds to strings
  for (var i = 0; i < tmp.length; i = i + 1) {
    tmp[i] = (tmp[i] < 10) ? '0' + tmp[i].toString() : tmp[i].toString();
  }

  return tmp.join(":");
};
/*
 * Method for updating the content of the current time label
 * @param time {int} the amount of time elapsed in seconds
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.updateTime = function(time) {
  var t = this.formatTime(parseInt(time, 10));
  this.$html.find('#current-' + this.config.id).html(t);
};
/*
 * Method for getting the control bar for the media player
 * @return {obj}: A jQuery wrapped set, the control bar for the media player
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.getControls = function() {
  var $controls = $('<span />').addClass('ui-corner-bottom').addClass('control-bar');

  // Insert the Nomensa Logo
  var $logo = $('<a />').attr('href', 'http://www.nomensa.com?ref=logo')
    .html('Accessible Media Player by Nomensa')
    .addClass('logo');
  $controls.append($logo);

  var $func = this.getFuncControls();
  var $vol = this.getVolControls();
  var $slider = this.getSliderBar();
  // Append all of our controls.  Doing it like this since
  // ie6 dies if we append recursively using native jQuery
  // append method
  var bits = [$func, $vol, $slider];

  for (var i = 0; i < bits.length; i = i + 1) {
    $controls[0].appendChild(bits[i][0]);
  }

  return $controls;
};
/*
 * Method for updating the visible volume labels
 * and any aria attributes if required
 * @param volume {int}: The new volume of the player
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.updateVolume = function(volume) {
  $('#vol-' + this.config.id).text(volume.toString() + '%');
  var $mute = this.$html.find('button.mute');

  if (volume == 0) {
    $mute.addClass('muted');
  } else {
    if ($mute.hasClass('muted')) {
      $mute.removeClass('muted');
    }
  }
};
/*
 * CAPTIONING
 * All logic for captioning here.  This is a bit of a hack
 * until such a time as captioning is better supported amongst
 * the main media players
 * @modifies {obj}: Adds a jQuery wrapped set of caption nodes to
 * the current object
 *------------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.getCaptions = function() {
  var self = this;
  if (self.config.captions) {
    var $captions = [];
    $.ajax({
      url: self.config.captions,
      success: function(data) {
        if ($(data).find('p').length > 0) {
          self.captions = $(data).find('p');
        }
      }
    });
  }
};
window.NOMENSA.player.MediaplayerDecorator.prototype.toggleCaptions = function () {
  var self = this;
  var $c = this.$html.find('.captions');
  if ($c.hasClass('captions-off')) {
    $c.removeClass('captions-off').addClass('captions-on');
    self.getPreviousCaption();
    self.setCaptionTimeout();
    self.config.captionsOn = true;
  } else {
    $c.removeClass('captions-on').addClass('captions-off');
    self.clearCaptionTimeout();
    self.$html.find('.caption').remove();
    self.config.captionsOn = false;
  }
};
/*
 * Method for updating/inserting the caption into the media player
 * html.
 *-----------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.syncCaptions = function() {
  var caption;
  if (this.captions) {
    var time = this.getCurrentTime();
    time = this.formatTime(parseInt(time, 10));
    caption = this.captions.filter('[begin="' + time + '"]');
    if (caption.length == 1) {
      this.insertCaption(caption);
    }
  }
};
/*
 * Method for inserting the caption into the media player dom
 * @param caption {obj}: A jQuery wrapped node from the captions file
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.insertCaption = function(caption) {
  if (this.$html.find('.caption').length == 1) {
    this.$html.find('.caption').text(caption.text());
  } else {
    var $c = $('<div>').text(caption.text());
    // We're only adding one class to the captions div
    // Use the native js version for speed
    $c[0].className = 'caption';
    this.$html.find('.video').prepend($c);
  }
};
/*
 * Method for obtaining the previous caption from the captions
 * file.  This is used when captions are turned off
 * @param time {float}: The time representing the current time of the player
 * If this is null or undefined we will get the current time from the player instance
 *----------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.getPreviousCaption = function(time) {
  var caption;
  if (time == undefined) {
    time = this.getCurrentTime();
  }
  var formattedTime = this.formatTime(parseInt(time, 10));
  if (this.captions) {
    caption = this.captions.filter('[begin="' + formattedTime + '"]');
    while((caption.length != 1) && (time > 0)) {
      time--;
      formattedTime = this.formatTime(parseInt(time, 10));
      caption = this.captions.filter('[begin="' + formattedTime + '"]');
    }
    if (caption.length == 1) {
      this.insertCaption(caption);
    }
  }
};
/*
 * Method for destroying the 3rd party
 * media player instance. Not all providers
 * apis allow us to do this. So provide overridable
 * method stub.
 */
window.NOMENSA.player.MediaplayerDecorator.prototype.destroyPlayerInstance = function() {
  // Youtube does not allow us to destroy
  // the player instance right now. Just return false
  return false;
};
/*
 * Method for destroying the player
 * Delegates to 'destroyPlayerInstance'
 * for destroying the 3rd party player instance
 */
window.NOMENSA.player.MediaplayerDecorator.prototype.destroy = function() {
  this.clearSliderTimeout();
  this.clearCaptionTimeout();
  this.destroyPlayerInstance();
  this.$html.remove();
};
/*
 * Set the timeout for updating captions.  Set to half a second since
 * we get some annoying floating point issues.  This is related to
 * a degree of lag because of time taken for traversal.
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.setCaptionTimeout = function() {
  var self = this;
  if (self.captionInterval == undefined) { // We don't wanna set more than 1 timeout.  If we do, we cannot turn it off
    self.captionInterval = setInterval(function() {
      self.syncCaptions();
    }, 500);
  }
};
/*
 * Clear the caption timeout
 *---------------------------------------------------------*/
window.NOMENSA.player.MediaplayerDecorator.prototype.clearCaptionTimeout = function() {
  if (this.captionInterval != undefined) { // Make sure the timeout is not undefined before clearing it
    this.captionInterval = clearInterval(this.captionInterval);
  }
};
