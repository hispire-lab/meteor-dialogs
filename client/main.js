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
  this._$modal = {};

  if (this._type === 'confirm') {
    this._options.buttons = [
      {
        name: 'no',
        label: 'No',
        className: 'btn-default',
      },
      {
        name: 'yes',
        label: 'Yes',
        className: 'btn-success',
      },
    ];
  }
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
    this._render();
  },

  hide() {
    this._$modal.modal('hide');
  },

  _getButtonByName(name) {
    return this._options.buttons.filter((button) => button.name === name)[0];
  },

  _render() {
    const $body = $('body');
    this._view = Blaze.renderWithData(Template.dialog_item, this._getDataCtx(), $body.get(0));
    this._setModal($body.find('.modal'));
  },

  _setModal($modal) {
    this._$modal = $modal;
    this._$modal.on('hidden.bs.modal', () => Blaze.remove(this._view));

    if (this._type === 'alert') {
      this._$modal.on('hidden.bs.modal', () => this._dialog.next());
    } else if (this._type === 'confirm') {
      const self = this;
      this._$modal
        .find('.btn')
        .on('click', (e) => {
          const button = self._getButtonByName($(e.target).data('button-name'));
          self._$modal.on('hidden.bs.modal', () => {
            self._callback(
              button.name === 'yes',
              self._dialog.next.bind(self._dialog),
              self._dialog.prev.bind(self._dialog),
              () => self._$modal.modal('hide')
            );
          });
          self.hide();
        });
    } else {
      const self = this;
      this._$modal
        .find('.btn')
        .on('click', (e) => {
          const button = self._getButtonByName($(e.target).data('button-name'));
          self._$modal.on('hidden.bs.modal', () => {
            button.callback(
              self._dialog.next.bind(self._dialog),
              self._dialog.prev.bind(self._dialog),
              () => self._$modal.modal('hide')
            );
          });
          self.hide();
        });
    }
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
  confirm(options) {
    this._addItem('confirm', options, options.callback);
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
      .alert({
        title: 'Chao',
        template: 'bye',
      })
      .confirm({
        title: 'Are you sure?',
        template: 'confirm',
        callback: (result) => console.log(result),
      })
      .show();
  },
});
