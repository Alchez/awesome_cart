window.awc_checkout = {};

awc_checkout = {
	showPage: function (page) {
		this.validate();

		$('.panel').slideUp('fast');
		$(page).slideDown('fast');
		var bcSelector = $(page).attr('data-bc');
		if (bcSelector) {
			var $bc = $(bcSelector);
			$('#checkout-breadcrumb .breadcrumb')
				.not($bc)
				.removeClass('active');
			$bc.addClass('active');
		}

	},

	validate: function () {
		var checkout_enabled = true;

		if (awc_checkout.shipping_provider) {
			var shipping_validation_response = awc_checkout.shipping_provider.validate();
			var shipping_summary = awc_checkout.shipping_provider.getSummary();
			$('#checkout-confirm-shipping .content').empty().append(shipping_summary);
			var totals = cart.totals;
			shipping_total = null;

			// find shipping total
			$.each(totals.other, function (i, t) {
				if (t.name == "Shipping") {
					shipping_total = t;
				}
			})


			if (shipping_validation_response.valid == false) {
				checkout_enabled = false;
				$('#checkout-confirm-totals .shipping-total .value').empty().append('<span class="error">-</span>');
				$('#checkout-confirm-totals .shipping-total .method').empty().append('<span class="error">(missing)</span>');
			} else {
				if (shipping_total) {
					$('#checkout-confirm-totals .shipping-total .value').empty().text(cart.storeAdapter.formatCurrency(shipping_total.value));
					$('#checkout-confirm-totals .shipping-total .method').empty().text("(" + shipping_total.label + ")");
				}
			}

			$('#checkout-confirm-totals .sub-total .value').text(cart.storeAdapter.formatCurrency(totals.sub_total));
			$('#checkout-confirm-totals .grand-total .value').text(cart.storeAdapter.formatCurrency(totals.grand_total));


			awc_checkout.shipping_address = shipping_validation_response.address;
		}

		if (awc_checkout.gateway_provider) {
			var billing_validation_response = awc_checkout.gateway_provider.validate();
			var billing_summary = awc_checkout.gateway_provider.getSummary();
			$('#checkout-confirm-billing .content').empty().append(billing_summary);

			if (billing_validation_response.valid == false) {
				checkout_enabled = false
			}

			awc_checkout.billing_address = billing_validation_response.address
		}

		// disable checkout until terms and condition box is checked
		if (!$('#confirm-form input[name="accept_terms"]').is(':checked')) {
			checkout_enabled = false;
		}

		awc_checkout.gateway_provider.enable(checkout_enabled);

	},

	nextPage: function () {
		var $page = $('.panel:visible');
		console.log($page);
		console.log($page.next());
		awc_checkout.showPage($page.next());
	},

	setupPage: function () {
		$('.panel .btn-next').click(awc_checkout.nextPage); //click for all next btn on all pages

		$('#checkout-shipping-address .btn-next')
			.click(function (e) {
				awc_checkout.showPage('#checkout-billing')
			})

		// map address "edit" Button clicks ----------------------------

		$('#checkout-confirm-shipping .btn-primary')
			.click(function (e) {
				if($('#checkout-shipping').attr('data-select') == "true") {
					e.preventDefault();
					awc_checkout.showPage('#checkout-shipping');
				} else {
					e.preventDefault();
					awc_checkout.showPage('#checkout-shipping-address');
				}
			})

		$('#checkout-confirm-billing .btn-primary')
			.click(function (e) {
				if($('#form-bill-addr').attr('data-select') == 'true') {
				e.preventDefault();
				awc_checkout.showPage('#checkout-billing');
				$('#select-bill-addr').css('display', 'none');
				$('#form-bill-addr').css('display', 'block');
			} else {
				e.preventDefault();
				awc_checkout.showPage('#checkout-billing');
				$('#form-bill-addr').css('display', 'none');
				$('#select-bill-addr').css('display', 'block');
			}
		})

		$('#checkout-error .btn-primary')
			.click(function () {
				awc_checkout.showPage('#checkout-billing');
			})

		$('#checkout-confirmation input[name="accept_terms"]')
			.change(function () {
				awc_checkout.validate();
			})

		// map breadcrumb clicks ---------------------------------------
		$('#bc-shipping').click(function (e) {
			if($('#checkout-shipping').attr('data-select') == "true") {
				e.preventDefault();
				awc_checkout.showPage('#checkout-shipping');
			} else {
				e.preventDefault();
				awc_checkout.showPage('#checkout-shipping-address');
			}
		});

		$('#bc-billing').click(function (e) {
			if($('#form-bill-addr').attr('data-select') == 'true') {
				e.preventDefault();
				awc_checkout.showPage('#checkout-billing');
				$('#select-bill-addr').css('display', 'none');
				$('#form-bill-addr').css('display', 'block');
			} else {
				e.preventDefault();
				awc_checkout.showPage('#checkout-billing');
				$('#form-bill-addr').css('display', 'none');
				$('#select-bill-addr').css('display', 'block');
			}
		});
		
		$('#bc-checkout').click(function (e) {
			e.preventDefault();
			awc_checkout.showPage('#checkout-confirmation');
		});
		
		$('#bc-shipping-method').click(function (e) {
			e.preventDefault();
			awc_checkout.showPage('#checkout-shipping-method');
		});

		// create a full cart feed from awesom cart js
		cart.newCartFeed('cart-full', {
			container: '#cart-full',
			tpl: cart.template('cart-full')
		})

		function onCartChanges() {
			var totals = cart.totals;

			$('#checkout-confirm-totals .sub-total .value').text(cart.storeAdapter.formatCurrency(totals.sub_total));
			$('#checkout-confirm-totals .grand-total .value').text(cart.storeAdapter.formatCurrency(totals.grand_total));

			// FIX: Babelfish issue, cart.totalItems getter not invoked in IF statement
			var totalItems = cart.totalItems;
			// make sure panels are visible once cart is processed and has items
			if (totalItems > 0) {
				$('#checkout-panels').fadeIn('fast')
			} else {
				$('#checkout-panels').hide()

			}
		}

		$('#checkout-shipping-address .btn-primary').click(function (e) {
			$('#checkout-shipping').attr('data-select', 'true');
			awc_checkout.showPage('#checkout-shipping');
		})

		$('#select-bill-addr .btn-add-bill-addr').click(function (e) {
			$('#form-bill-addr').attr('data-select', 'true');
			$('#select-bill-addr').css('display', 'none');
			$('#form-bill-addr').css('display', 'block');
		})
		//clicking ship addr
		$('#checkout-shipping-address .addr').click(function (e) {
			e.stopPropagation();
			$('#shipping-addrs .selected').removeClass('selected');
			$(this).addClass('selected');
			awc_checkout.showPage('#checkout-billing');
		})
		//clicking bill addr
		$('#billing-addrs .addr').click(function (e) {
			e.stopPropagation();
			$('#billing-addrs .selected').removeClass('selected');
			$(this).addClass('selected');
			awc_checkout.showPage('#checkout-shipping-method');
		})

		$("#awc-shipping-form .btn-back").click(function (e) {
			e.preventDefault();
			$('#checkout-shipping').attr('data-select', 'false');
			$('#checkout-shipping-address .addr').removeClass('selected');
			awc_checkout.showPage('#checkout-shipping-address');
		})

		$("#form-bill-addr .btn-back").click(function (e) {
			e.preventDefault();
			$('#form-bill-addr').attr('data-select', 'false');
			$('#select-bill-addr .addr').removeClass('selected');
			$('#select-bill-addr').css('display', 'block');
			$('#form-bill-addr').css('display', 'none');
		})

		cart.on('init', onCartChanges);
		cart.on('update', onCartChanges);

	}
}

awc_checkout.setupPage();