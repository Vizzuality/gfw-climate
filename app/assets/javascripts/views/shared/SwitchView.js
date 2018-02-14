define(
  [
    'backbone',
    'underscore',
    'handlebars',
    'text!templates/shared/switch.handlebars'
  ],
  function(Backbone, _, Handlebars, tpl) {
    'use strict';
    var DataDownloadIndexView = Backbone.View.extend({
      template: Handlebars.compile(tpl),

      events: {
        'click .js-option': 'onOptionChange'
      },

      initialize: function(settings) {
        this.render(settings.data);
        this.param = settings.param;
      },

      render: function(data) {
        this.$el.html(this.template(data));
        if (data && data.options) {
          this.value = data.options[0].value;
          _.each(
            data.options,
            function(d) {
              if (d.selected) {
                this.value = d.value;
              }
            }.bind(this)
          );
        }
      },

      onOptionChange: function(e) {
        var item = e.currentTarget;
        if (item) {
          var value = item.dataset.value;
          this.$('.js-option').each(function(index, i) {
            i.classList.remove('is-active');
          });
          item.classList.add('is-active');
          this.value = value;
          this.trigger('onSelectionchange', value);
        }
      }
    });

    return DataDownloadIndexView;
  }
);
