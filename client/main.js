import { Template } from 'meteor/templating';

import './main.html';

Dialog = function Dialog() {
  this._itemOptions = [];
  this._currentItem;
};

Dialog.prototype.alert = function(options) {
  this._itemOptions.push({
    dialog: this,
    dialogItemType: 'alert',
    dialogItemOptions: options
  });
  return this;
};

Dialog.prototype.confirm = function(options) {
  options.buttons = [
    {
      name: 'cancel',
      label: 'Cancel',
      className: 'btn-default'
    },
    {
      name: 'ok',
      label: 'Ok',
      className: 'btn-success',
    },
  ]
  this._itemOptions.push({
    dialog: this,
    dialogItemType: 'confirm',
    dialogItemOptions: options
  });
  return this;
};

Dialog.prototype.prompt = function() {};

Dialog.prototype.show = function() {
  var item;
  if ( this._itemOptions.length > 0 ) {
    item = this._itemOptions.shift();
    this._currentItem = item;
    this._renderItem(item);
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
      .confirm({
        title: 'Confirm',
        template: 'confirm',
        callback: function(next, result) {
          console.log('confirm called with result: ', result);
          if ( result ) { next() }
        }
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
    var data   = instance.data;
    var dialog = data.dialog;
    var next   = dialog.show;
    var type   = data.dialogItemType;
    var result;

    if ( type === 'confirm' ) {
      result = $(e.target).text() === 'Ok';
      dialog._currentItem.dialogItemOptions.callback(next.bind(dialog), result);

    }
    else {
      data.button.callback(next.bind(dialog));
    }
  }
})
