# [Nomensa](http://www.nomensa.com/) - Accessible Media Player

## About

The Nomensa accessible media player is a flexible multimedia solution for websites and intranets.
The core player consists of JavaScript wrapper responsible for generating an accessible HTML toolbar
for interacting with a media player of your choice. We currently provide support for YouTube (default),
Vimeo and JWPlayer although it should be possible to integrate the player with almost any media player on
the web (provided a JavaScript api for the player in question is available).

## Configuration

For information on implementing the Accessible Media Player please refer to the Accessible-media-player_2.0_documentation.pdf file in the root of this git repository.
In addition to this a number of example configurations have been provided inside the [example](https://github.com/nomensa/Accessible-Media-Player/tree/master/example) directory within this repository.

## Notes

There is currently a bug in the JW Player related to loading video and audio files using relative paths.
For more information about this issue please refer to
http://www.longtailvideo.com/support/forums/jw-player/setup-issues-and-embedding/10303/flv-relative-path-problem

## Development

To run the tests you can either load the TestRunner.html file in the
/test directory or run `./run_tests.sh` in your terminal.

To compress the library for deployment you can run the provided script
which uses the YUI Compressor using `./compress_js.sh`.

## Author

This project was created and is maintained by the friendly folks at [Nomensa](http://www.nomensa.com) for your benefit.
We welcome your feedback and any suggestions on ways in which we can improve the project.

## License

This project is licensed under the [GPL version 3 license](http://www.gnu.org/licenses/gpl.html).  As such you are free to use,
modify or distribute it free of charge.

## Copyright

&copy; Nomensa 2012

## Credits

We use:

1. [jQuery](http://jquery.com/)
2. [jQuery UI](http://jqueryui.com/)
3. [JW Player](http://www.longtailvideo.com/players/)
4. [Vimeo](http://vimeo.com/)
5. [YouTube](http://www.youtube.com/)
