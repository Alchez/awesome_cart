# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt
from __future__ import unicode_literals

no_cache = 1
no_sitemap = 1

import frappe
import json

from erpnext.shopping_cart.cart import get_cart_quotation
from awesome_cart import cart
from awesome_cart.templates.pages import gateway

def get_context(context):
	"""This is a controller extension for erpnext.templates.pages.cart"""

	settings = frappe.db.get("Awc Settings")

	# remove? shipping is essential here anyways
	context.shipping_enabled = 1 if settings.awc_shipping_enabled else 0

	# flag to display login form
	context.is_logged = cart.is_logged()
	
	# Let gateway page update context to embed gateway forms
	gateway.get_context(context)
