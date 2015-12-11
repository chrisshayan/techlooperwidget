module.exports = function (grunt) {
  var timestamp = Date.now();
  var version = "1.0";

  grunt.file.defaultEncoding = "utf8";

  grunt.initConfig({

    "bower-install-simple": {
      options: {
        directory: "<%=baseDir%>/bower_components"
      },
      build: {
        options: {
          production: true,
          forceLatest: true
        }
      }
    },

    requirejs: {
      options: {
        baseUrl: "<%=baseDir%>",
        skipModuleInsertion: false,
        optimizeAllPluginResources: true,
        findNestedDependencies: true
      },
      css: {
        options: {
          cssIn: "<%=baseDir%>/css/embed.css",
          out: "<%=baseDir%>/css/embed.min.css",
          optimizeCss: "standard"
        }
      },
      js: {
        options: {
          paths: {
            text: "bower_components/text/text",
            jquery: "bower_components/jQuery/dist/jquery",
            ractive: "bower_components/ractive/ractive",
            'amd-loader': "bower_components/rv/amd-loader",
            rv: "bower_components/rv/rv",
            almond: "bower_components/almond/almond"
          },
          name: "bower_components/almond/almond",
          //almond: true,
          include: ['app/_main.js'],
          out: "<%=baseDir%>/embed.min.js",
          //optimize: "none",
          stubModules: ['rv', 'amd-loader', 'text']
        }
      }
    },

    copy: {
      src: {
        files: [
          {
            cwd: "<%=src%>",
            expand: true,
            //src: ["**", "!**/node_modules/**"],
            src: ["app/**", "css/**", "js/**", "sample/**", "templates/**", "*.html"],
            dest: "<%=baseDir%>"
          }
        ]
      }
    },

    replace: {
      local: {
        options: {
          patterns: [{json: {backendUrl: "http://localhost:8080", version: version}}]
        },
        files: {
          "<%=baseDir%>/embed.min.js": "<%=baseDir%>/embed.min.js"
        }
      },

      staging: {
        options: {
          patterns: [{json: {backendUrl: "http://staging.techlooper.com", version: version}}]
        },
        files: [
          {cwd: "<%=baseDir%>/app", expand: true, flatten: true, src: ["**"], dest: "<%=baseDir%>/app"},
          {cwd: "<%=baseDir%>/sample", expand: true, flatten: true, src: ["**"], dest: "<%=baseDir%>/sample"}
        ]
      },

      prod: {
        options: {
          patterns: [{json: {backendUrl: "http://techlooper.com", version: version}}]
        },
        files: [
          {cwd: "<%=baseDir%>/app", expand: true, flatten: true, src: ["**"], dest: "<%=baseDir%>/app"},
          {cwd: "<%=baseDir%>/sample", expand: true, flatten: true, src: ["**"], dest: "<%=baseDir%>/sample"}
        ]
      }
    },

    watch: {
      scripts: {files: ["*.js", "*.json"], options: {livereload: true}},
      markup: {files: ["*.html"], options: {livereload: true}},
      stylesheets: {files: ["*.css"], options: {livereload: true}}
    },

    connect: {
      server: {
        options: {port: 8000, base: "<%=baseDir%>", keepalive: true}
      }
    },

    compress: {
      target: {
        options: {archive: "techlooper-widget-<%=env%>.zip"},
        files: [{expand: true, cwd: 'target/', src: ['**']}]
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask("clean", "clean last build", function () {
    grunt.file.delete("target");
    grunt.file.delete("bower_components");
    grunt.file.delete("css/embed.min.css");
    grunt.file.delete("embed.min.js");
  });

  grunt.registerTask("clear-target", "clean last build", function () {
    grunt.file.delete("target/bower_components");
    grunt.file.delete("target/templates");
  });

  grunt.registerTask("build", ["bower-install-simple:build", "requirejs:css", "requirejs:js"]);
  grunt.registerTask("build-target", ["build", "clear-target", "compress:target"]);
  grunt.registerTask("run", ["connect", "watch"]);

  grunt.registerTask("staging-run", ["staging", "run"]);

  grunt.registerTask("local", "build dev env", function () {//build local
    grunt.config("baseDir", ".");
    grunt.task.run(["clean", "build", "replace:local", "run"]);
  });

  grunt.registerTask("staging", "build staging env", function () {//build staging
    grunt.file.mkdir("target");
    grunt.config("src", ".");
    grunt.config("baseDir", "./target");
    grunt.config("env", "staging");
    grunt.task.run(["clean", "copy:src", "replace:staging", "build-target"]);
  });

  grunt.registerTask("prod", "build prod env", function () {//build prod
    grunt.file.mkdir("target");
    grunt.config("src", ".");
    grunt.config("baseDir", "./target");
    grunt.config("env", "prod");
    grunt.task.run(["clean", "copy:src", "replace:prod", "build-target"]);
  });
};