# WPDev
boilerplate for building WordPress-themes using Gulp

## Configuration
All config is done using the `wp_project.json` file in the root of the project.

### Theme
Every WordPress-theme provides meta data in the file header of `style.css`. WPDev manages this for you in your config file. For more information on available tags, pleace visit the [WordPress Codex](https://codex.wordpress.org/File_Header).

### Build
Here, you provide information on how to build your project.

`proxy` is the URL to a WordPress installation where you test your theme. On starting gulp, a new browser tab will open at this URL, reloading the site every time a build is complete.

`style` is SCSS stylesheets

`vendorJS`

`customJS`

`views`

## TODO
- implement sftp to test server
- build a boilerplate theme