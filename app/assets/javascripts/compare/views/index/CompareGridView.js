define([
  'backbone',
  'compare/presenters/CompareGridPresenter',
  'widgets/views/WidgetView',
  'text!compare/templates/compareGrid.handlebars',
], function(Backbone, CompareMainPresenter, WidgetView, tpl) {

  var CompareMainView = Backbone.View.extend({

    el: '#compareGridView',

    template: Handlebars.compile(tpl),

    initialize:function() {
      this.presenter = new CompareMainPresenter(this);
    },

    setListeners: function() {

    },

    render: function() {
      this.$el.html(this.template(this.parseData()));

      var status = {
        widgets: [],
        promises: []
      };

      var widgetsIds = this.presenter.status.get('widgets');
      var data = this.presenter.status.get('data');

      // Loop each widget and get data of each compare
      _.each(widgetsIds, _.bind(function(w){
        _.each(data, _.bind(function(c,i){
          var deferred = $.Deferred();
          var slug = this.presenter.objToSlug(this.presenter.status.get('compare'+(i+1)),'');
          var slug_compare = this.presenter.objToSlug(this.presenter.status.get('compare'+((data.length) - i )), '');
          var currentWidget = new WidgetView({
            id: w,
            className: 'gridgraphs--widget',
            model: {
              id: w,
              location: this.presenter.status.get('compare'+(i+1)),
              slug: slug,
              slug_compare: slug_compare,
            },
            status: this.presenter.status.get('options')[slug][w][0]
          });

          currentWidget._loadMetaData(function(data) {
            deferred.resolve(data);
          });

          // Set persistent variables
          status.widgets.push(currentWidget);
          status.promises.push(deferred);
        }, this ));
      }, this ));

      $.when.apply(null, status.promises).then(function() {
        status.widgets.forEach(function(widget) {
          widget.render();
          $('#gridgraphs-compare-'+widget.id).append(widget.el);
        });
      });
    },

    parseData: function() {
      return {
        widgets: this.presenter.status.get('widgets')
      };
    }



  });

  return CompareMainView;

});
