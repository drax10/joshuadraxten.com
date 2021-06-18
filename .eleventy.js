const CleanCSS = require("clean-css");
var UglifyJS = require("uglify-js");

module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("img");

  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addFilter("jsmin", function(code) {
    return UglifyJS.minify(code, {mangle: {
      toplevel: true,
    }}).code;
  });

  const toMonth = new Intl.DateTimeFormat('en', { month: 'long' });
  eleventyConfig.addFilter("dateymd", function(date) {
    return date instanceof Date ?
        date.getUTCDate() + ' ' + toMonth.format(date) + ', ' + date.getUTCFullYear() : ''
  });

  eleventyConfig.addFilter("lowercase", str => str ? str.toLowerCase() : '')

  eleventyConfig.addFilter("parsehtmlentities", function( str ){
    str = str.replace(/&amp;/g, '&');
    console.log( str )
    return str.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
      var num = parseInt(numStr, 10); // read num as normal number
      return String.fromCharCode(num);
    });
  })

};