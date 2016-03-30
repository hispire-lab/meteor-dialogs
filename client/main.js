import { Template } from 'meteor/templating';

import './main.html';

Dialog = function Dialog() {
  this._itemOptions = [];
};

Dialog.prototype.alert = function(options) {
  this._itemOptions.push({
    dialog: this,
    dialogItemOptions: options
  });
  return this;
};

Dialog.prototype.confirm = function() {};

Dialog.prototype.prompt = function() {};

Dialog.prototype.show = function() {
  if ( this._itemOptions.length > 0 ) {
    this._renderItem(this._itemOptions.shift());
  }
};

Dialog.prototype._renderItem = function(itemOptions) {
  Blaze.renderWithData(Template.dialog_item, itemOptions, $('body').get(0));
};


Template.dialog_item.onCreated(function() {

});

Template.dialog_item.onRendered(function() {
  $(Template.instance().firstNode).modal('show');
});

Template.dialog_buttons_list.events({
  'click .js-dialog-show': function(e) {
    e.preventDefault();

    var dialog = new Dialog();
    dialog
      .alert({
        title: 'Welcome',
        template: 'hello',
        buttons: [
          {
            name: 'close',
            label: 'Close',
            className: 'btn-default',
            callback: function() {
              console.log('close called');
            }
          },
          {
            name: 'success',
            label: 'Success',
            className: 'btn-success',
            callback: function(next) {
              console.log('success called');
              next();
            }
          },
        ]
      })
      .alert({
        title: 'Goodbye',
        template: 'bye'
      })
      .show()
  }
});

Template.dialog_button.events({
  'click .btn': function(e, instance) {
    e.preventDefault();
    var next = instance.data.dialog.show;
    instance.data.button.callback(next.bind(instance.data.dialog));
  }
})
