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
- print wp_project.theme information into style.css
- implement other build tasks
- implement sftp to test server
- on test environment, the sourcemaps should actually work. Debugging has to be easy. not possible if only build-folder is uploaded to test server
- automatically zip the entire thing
- build a boilerplate theme