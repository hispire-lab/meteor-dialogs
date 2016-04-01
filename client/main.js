import { Blaze } from 'meteor/blaze';
import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import './main.html';

function DialogItem(dialog, type, options, callback) {
  this._dialog = dialog;
  this._type = type;
  this._options = options;
  this._callback = callback;
  this._view = {};
}

DialogItem.prototype = {

  _getDataCtx() {
    return {
      dialogItem: {
        instance: this,
        dialog: this._dialog,
        type: this._type,
        title: this._options.title,
        template: this._options.template,
        buttons: this._options.buttons,
      },
    };
  },

  show() {
    this._view = Blaze.renderWithData(Template.dialog_item, this._getDataCtx(), $('body').get(0));
  },

  hide($modal) {
    const self = this;
    $modal.on('hidden.bs.modal', () => Blaze.remove(self._view));
    $modal.modal('hide');
  },

};

function Dialog() {
  this._items = [];
  this._currentItemIndex = 0;
}

Dialog.prototype = {
  /*
   * alert items can render simple strings, inline html
   * or a template. The callback triggers when the alert
   * item is hidden.
   */
  alert(options, hidden) {
    this._addItem('alert', options, hidden);
    return this;
  },
  /*
   * confirm items can render simple strings, inline html
   * or a template. This items will have two buttons, ok and cancel,
   * The callback triggers when any of the two buttons is pressed and
   * takes a boolean result param.
   */
  confirm(options, confirmed) {
    this._addItem('confirm', confirmed, options);
    return this;
  },

  prompt() {
    return;
  },

  custom(options) {
    this._addItem('custom', options);
    return this;
  },
  /*
   * renders the current item in the dialog.
   */
  show() {
    this._items[this._currentItemIndex].show();
  },
  /*
   * renders the next item in the dialog if any.
   */
  next() {
    if (this._currentItemIndex < this._items.length - 1) {
      this._currentItemIndex += 1;
      this.show();
    }
  },
  /*
   * renders the prev item in the dialog if any.
   */
  prev() {
    if (this._currentItemIndex > 0) {
      this._currentItemIndex -= 1;
      this.show();
    }
  },

  _addItem(type, options, callback) {
    this._items.push(new DialogItem(this, type, options, callback));
  },

};

Template.dialog_item.onRendered(() => {
  const instance = Template.instance();
  $(instance.firstNode).modal('show');
});

Template.dialog_item_button.onCreated(function dialogItemButtonOnCreated() {
  this.closeModal = ($modal) => $modal.modal('hide');
});

Template.dialog_item_button.events({
  'click .btn': (e, instance) => {
    e.preventDefault();

    const data = instance.data;
    const $modal = $(e.target).closest('.modal');

    $modal.on('hidden.bs.modal', () => {
      data.button.callback(
        data.dialog.next.bind(data.dialog),
        data.dialog.prev.bind(data.dialog),
        instance.closeModal.bind({}, $modal)
      );
    });
    data.dialogItem.hide($modal);
  },
});

Template.dialog_buttons_list.events({
  'click .js-dialog-show': (e) => {
    e.preventDefault();

    new Dialog()
      .custom({
        title: 'Welcome',
        template: 'hello',
        buttons: [
          {
            name: 'close',
            label: 'Close',
            className: 'btn-default',
            callback: (next, prev, done) => done(),
          },
          {
            name: 'success',
            label: 'Success',
            className: 'btn-success',
            callback: (next) => next(),
          },
        ],
      })
      .custom({
        title: 'Goodbye',
        template: 'bye',
        buttons: [
          {
            name: 'close',
            label: 'Close',
            className: 'btn-default',
            callback: (next, prev, done) => done(),
          },
          {
            name: 'invalid',
            label: 'Invalid',
            className: 'btn-info',
            callback: (next, prev) => prev(),
          },
          {
            name: 'success',
            label: 'Success',
            className: 'btn-success',
            callback: (next) => next(),
          },
        ],
      })
      .show();
  },
});
