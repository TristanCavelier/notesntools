/*jslint indent: 2 */
/*global module */

module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    jslint: {
      grunt: {
        src: ['Gruntfile.js']
      },
      mylib: {
        src: ['src/**/*.js']
      }
    },
    browserify: {
      mylib: {
        src: ['src/browserify.js'],
        dest: "mylib.min.js",
        options: {
          ignore: ['lib/*.js']
        }
      }
    },
    concat: {
      mylib: {
        src: [
          "src/wrap/browserify.start",
          "mylib.min.js",
          "src/wrap/browserify.end"
        ],
        dest: 'mylib.min.js'
      }
    },
    uglify: {
      mylib: {
        src: 'mylib.min.js',
        dest: 'mylib.min.js',
        options: {
          banner: '// Hello!!\n'
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-jslint");
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask('default', ['jslint', 'browserify', 'concat', 'uglify']);
  grunt.registerTask('test', ['jslint']);
  grunt.registerTask('build', ['browserify', 'concat', 'uglify']);
  grunt.registerTask('build_debug', ['browserify', 'concat']);
};
