module.exports = function(grunt) {

  grunt.initConfig({
    requirejs: {
      std: {
        options: {
          baseUrl: 'src',
          // paths: {
          //   mylibbuild: '../mylibbuild' // from baseUrl dir
          // },
          include: ['mylib'], // from baseUrl dir
          exclude: ['../lib/jquery'], // from baseUrl dir
          out: 'dist/mylib.js', // from Gruntfile.js dir
          wrap: { // from Gruntfile.js dir
            startFile: 'src/wrap/wrap.start',
            endFile: 'src/wrap/wrap.end'
          }
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-requirejs");

  grunt.registerTask('default', ['requirejs']);
  grunt.registerTask('build', 'requirejs');
};
