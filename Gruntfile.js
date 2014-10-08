module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('config/aws.json'),
    copy: {
      target: {
        files: [
          {
            expand: true,
            src: ['bower/d3/d3.min.js'],
            dest: 'build/scripts/lib/',
            rename: function (dest, src) {
              return dest + src.substring(src.lastIndexOf('/')).replace('.min','');
            }
          },
          {
            expand: true,
            flatten: true,
            src: [
              'src/scripts/lib/flatpage_stubs.js'
            ],
            dest: 'build/scripts/lib/'
          },
          { expand: true, flatten: true, src: ['src/data/*'], dest: 'build/data/' }
        ]
      }
    },

    jshint: {
      files: [
        'src/scripts/*.js'
      ],
      options: {
        browser: true,
        curly: true,
        eqeqeq: true,
        latedef: true,
        undef: true,
        unused: true,
        trailing: true,
        smarttabs: true,
        indent: 2,
        globals: {
          jQuery: true,
          $: true,
          _: true
        }
      }
    },

    uglify: {
      options: {
        mangle: { except: ['d3', '_','$'] },
        compress: true,
        report: 'gzip'
      },
      my_target: {
        files: {
          'build/scripts/flu_hospitalization.js' : ['src/scripts/flu_hospitalization.js'],
          'build/scripts/flu_vaccination.js'    : ['src/scripts/flu_vaccination.js']
        }
      }
    },

    processhtml: {
      options: {
        process: true,
        strip: true
      },
      build: {
        files: {
          'tmp/index.html'               : ['src/index.html'],
          'tmp/flu_hospitalization.html' : ['src/flu_hospitalization.html'],
          'tmp/flu_vaccination.html'     : ['src/flu_vaccination.html']
        }
      }
    },

    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapsWhitespace: true,
          useShortDoctype: true
        },
        files: {
          'build/index.html'                  : 'tmp/index.html',
          'build/flu_hospitalization.html'    : 'tmp/flu_hospitalization.html',
          'build/flu_vaccination.html'        : 'tmp/flu_vaccination.html'
        }
      }
    },

    cssmin: {
      compress: {
        options: {
          report: 'gzip'
        },
        files: {
          'build/style/app.css'      : ['src/style/app.css'],
          'build/style/skeleton.css' : ['src/style/skeleton.css']
        }
      }
    },

    s3: {
      options: {
        accessKeyId: "<%= aws.key %>",
        secretAccessKey: "<%= aws.secret %>",
        bucket: "<%= aws.bucket %>",
        access: "public-read",
        gzip: true,
        cache: false
      },
      build: {
        cwd: "build/",
        src: "**"
      }
    },

    bowercopy: {
      options: {
        // clean: true,
        runBower: true,
        report: true
      },
      test: {
        options: {
          destPrefix: 'test'
        },
        files: {
          "boot.js": "jasmine/lib/jasmine-core/boot.js",
          "console.js": "jasmine/lib/console/console.js",
          "jasmine-html.js": "jasmine/lib/jasmine-core/jasmine-html.js",
          "jasmine.css": "jasmine/lib/jasmine-core/jasmine.css",
          "jasmine.js": "jasmine/lib/jasmine-core/jasmine.js",
          "jasmine_favicon.png": "jasmine/images/jasmine_favicon.png",
          "sinon.js": "sinon/lib/sinon.js"
        }
      },
      lib: {
        options: {
          destPrefix: 'src/scripts/lib'
        },
        files: {
          "d3.js": "bower/d3/d3.min.js"
        }
      }
    },

    express: {
      dev: {
        options: {
          hostname: '*',
          port: 8000,
          bases: 'src',
          livereload: true,
          showStack: true
        }
      },
      test: {
        options: {
          hostname: '*',
          port: 8080,
          bases: '.',
          livereload: true
        }
      }
    },

    open: {
      dev: {
        path: 'http://localhost:<%= express.dev.options.port %>',
        app: "Google Chrome"
      },
      test: {
        path: 'http://localhost:<%= express.test.options.port %>/SpecRunner.html',
        app: "Google Chrome"
      }
    },

    watch: {
      dev: {
        files: ['src/*.html','src/scripts/*.js','src/style/**/*.css'],
        options: {
          livereload: true
        }
      },
      test: {
        files: ['src/index.html','src/scripts/*.js','spec/*.js'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-aws');
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('default', ['bowercopy','copy','uglify','cssmin','processhtml', 'htmlmin','s3']);
  grunt.registerTask('build', ['bowercopy','copy','uglify','cssmin','processhtml', 'htmlmin']);
  grunt.registerTask('deploy', ['s3']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('server', ['express:dev','open:dev','watch:dev','express-keepalive']);
  grunt.registerTask('server:test', ['express:test','open:test','watch:test','express-keepalive']);
};

