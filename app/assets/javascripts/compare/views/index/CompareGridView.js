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

      // Loop each country and get data and render its widgets
      _.map(this.presenter.status.get('data'), _.bind(function(c,i){
        // Create persistent variables
        var status = {
          el: null,
          widgets: [],
          promises: []
        };

        _.each(c.widgets, _.bind(function(w) {
          var deferred = $.Deferred();
          var slug = this.presenter.objToSlug(this.presenter.status.get('compare'+(i+1)),'');
          var currentWidget = new WidgetView({
            id: w.id,
            iso: c.iso,
            slug: slug,
            options: this.presenter.status.get('options')[slug][w.id][0]
          });

          currentWidget._loadMetaData(function(data) {
            deferred.resolve(data);
          });

          // Set persistent variables
          status.el = $('#compare-grid-'+slug);
          status.widgets.push(currentWidget);
          status.promises.push(deferred);
        }, this ));

        // Promises of each country resolved
        $.when.apply(null, status.promises).then(function() {
          status.widgets.forEach(function(widget) {
            widget.render();
            status.el.append(widget.el);
          });
        });
      }, this ));
    },

    parseData: function() {
      return {
        compare1slug: this.presenter.objToSlug(this.presenter.status.get('compare1'),''),
        compare2slug: this.presenter.objToSlug(this.presenter.status.get('compare2'),'')
      };
    }



  });

  return CompareMainView;

});
