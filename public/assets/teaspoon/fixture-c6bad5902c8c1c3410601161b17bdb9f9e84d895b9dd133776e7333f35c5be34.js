(function() {
  var slice = [].slice;

  Teaspoon.Fixture = (function() {
    var addContent, cleanup, create, load, loadComplete, preload, putContent, set, xhr, xhrRequest;

    Fixture.cache = {};

    Fixture.el = null;

    Fixture.$el = null;

    Fixture.json = [];

    Fixture.preload = function() {
      var i, len, results, url, urls;
      urls = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      results = [];
      for (i = 0, len = urls.length; i < len; i++) {
        url = urls[i];
        results.push(preload(url));
      }
      return results;
    };

    Fixture.load = function() {
      var append, i, index, j, len, results, url, urls;
      urls = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), append = arguments[i++];
      if (append == null) {
        append = false;
      }
      if (typeof append !== "boolean") {
        urls.push(append);
        append = false;
      }
      results = [];
      for (index = j = 0, len = urls.length; j < len; index = ++j) {
        url = urls[index];
        results.push(load(url, append || index > 0));
      }
      return results;
    };

    Fixture.set = function() {
      var append, html, htmls, i, index, j, len, results;
      htmls = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), append = arguments[i++];
      if (append == null) {
        append = false;
      }
      if (typeof append !== "boolean") {
        htmls.push(append);
        append = false;
      }
      results = [];
      for (index = j = 0, len = htmls.length; j < len; index = ++j) {
        html = htmls[index];
        results.push(set(html, append || index > 0));
      }
      return results;
    };

    Fixture.cleanup = function() {
      return cleanup();
    };

    function Fixture() {
      window.fixture.load.apply(window, arguments);
    }

    xhr = null;

    preload = function(url) {
      return load(url, false, true);
    };

    load = function(url, append, preload) {
      var cached, value;
      if (preload == null) {
        preload = false;
      }
      if (cached = window.fixture.cache[url]) {
        return loadComplete(url, cached.type, cached.content, append, preload);
      }
      value = null;
      xhrRequest(url, function() {
        if (xhr.readyState !== 4) {
          return;
        }
        if (xhr.status !== 200) {
          throw "Unable to load fixture \"" + url + "\".";
        }
        return value = loadComplete(url, xhr.getResponseHeader("content-type"), xhr.responseText, append, preload);
      });
      return value;
    };

    loadComplete = function(url, type, content, append, preload) {
      window.fixture.cache[url] = {
        type: type,
        content: content
      };
      if (type.match(/application\/json;/)) {
        return Fixture.json[Fixture.json.push(JSON.parse(content)) - 1];
      }
      if (preload) {
        return content;
      }
      if (append) {
        addContent(content);
      } else {
        putContent(content);
      }
      return window.fixture.el;
    };

    set = function(content, append) {
      if (append) {
        return addContent(content);
      } else {
        return putContent(content);
      }
    };

    putContent = function(content) {
      cleanup();
      create();
      return window.fixture.el.innerHTML = content;
    };

    addContent = function(content) {
      if (!window.fixture.el) {
        create();
      }
      return window.fixture.el.innerHTML += content;
    };

    create = function() {
      var ref;
      window.fixture.el = document.createElement("div");
      if (typeof window.$ === 'function') {
        window.fixture.$el = $(window.fixture.el);
      }
      window.fixture.el.id = "teaspoon-fixtures";
      return (ref = document.body) != null ? ref.appendChild(window.fixture.el) : void 0;
    };

    cleanup = function() {
      var base, ref, ref1;
      (base = window.fixture).el || (base.el = document.getElementById("teaspoon-fixtures"));
      if ((ref = window.fixture.el) != null) {
        if ((ref1 = ref.parentNode) != null) {
          ref1.removeChild(window.fixture.el);
        }
      }
      return window.fixture.el = null;
    };

    xhrRequest = function(url, callback) {
      var e;
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        try {
          xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (_error) {
          e = _error;
          try {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (_error) {
            e = _error;
          }
        }
      }
      if (!xhr) {
        throw "Unable to make Ajax Request";
      }
      xhr.onreadystatechange = callback;
      xhr.open("GET", Teaspoon.root + "/fixtures/" + url, false);
      return xhr.send();
    };

    return Fixture;

  })();

}).call(this);
