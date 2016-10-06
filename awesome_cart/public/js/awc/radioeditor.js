frappe.provide("awc");

awc.RadioEditor = Class.extend({
	init: function($el, $actions, formatter, new_label) {
		
		if ( $el.length == 0 ) {
			console.log("Invalid jquery object", $el);
		}

		this.$el = $el
		this.$actions = $actions
		this.$container = $el.find('.data');
		this.formatter = formatter
		this.source = $el.attr('data-source');
		this.group = $el.attr('data-group');
		this.start = 0;
		this.limit = 5;

		var btn_new_id = this.group + "-new-btn";
		this.$btn_new = $(
			'<div class="btn">'+
				'<input type="radio" id="'+btn_new_id+'" name="' + this.group + '" value="new"/>'+
				'<label for="'+btn_new_id+'">' + new_label + '</label>'+
			'</div>');

		this.$actions.append(this.$btn_new);

		if ( !this.source ) {
			console.log("Invalid data source [empty]");
		}
	},

	get_options_el: function() {
		var options = this.$el.find('input[type=radio][name=' + this.group + ']');
		return options.add(this.$btn_new.find('input'));
	},

	select_option: function($el, mode) {
		
		$el.prop('checked', 'checked'); // make sure ui reflects change
		this.get_options_el().not($el).closest('label').removeClass('selected');
		$el.closest('label').addClass('selected');

		this.get_options_el().not($el).closest('label').find('.content').slideUp('fast');
		$el.closest('label').find('.content').slideDown('fast');
		this.$el.trigger('option-' + mode, [$el.val(), $el.data('record'), mode]);
		
	},

	update: function() {
		var scope = this;
		frappe.call({
			method: this.source,
			args: { "start": this.start, "limit": this.limit },
			callback: function(r) {
				var result = r.message;
				scope.$container.empty();
				$.each(r.message, function(k, v) {
					var line = scope.formatter(v);
					var id = scope.group + "_" + line.value;
					var $option = $(
						'<label for="' + id + '">'+
							'<div class="row" data-value="' + line.value + '">' + 
								'<div class="col-md-12">' +
									'<input type="radio" id="' + id +'" name="'+scope.group+'" value="' + line.value + '" />' +
									'<div class="label">' + line.label + '</div>'+
									'<div class="content">' + line.detail + '</div>'+
									'<div class="editor-actions">' +
										'<button class="btn btn-remove">Remove</button>' +
										'<button class="btn btn-edit">Edit</button>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'</label>');
					scope.$container.append($option);
					$option.find('input').data('record', v);
					$option.find('.btn-edit').click(function() {
						var $input = $(this).closest('label').find('input');
						scope.select_option($input, 'edit');
					});
					$option.find('.btn-remove').click(function() {
						var $input = $(this).closest('label').find('input');
						scope.select_option($input, 'remove');
					});
				});

				scope.get_options_el().off('change');
				scope.get_options_el().change(function() {
					var $checked = $(this).filter(':checked');
					if ( $checked.length > 0 ) {
						scope.select_option($checked, 'select');
					}
				});
			}
		});
	}
});
