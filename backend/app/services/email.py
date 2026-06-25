import logging
from decimal import Decimal

from app.core.config import settings
from app.schemas.order import OrderOut

logger = logging.getLogger(__name__)

_BRAND_COLOR = "#ffb3bf"
_BRAND_DARK = "#e8909f"
_SURFACE = "#fff5f7"
_BORDER = "#ffd6de"
_TEXT = "#1a1a1a"
_MUTED = "#6b7280"


def _build_conf():
    from fastapi_mail import ConnectionConfig

    return ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_USER,
        MAIL_PASSWORD=settings.SMTP_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.SMTP_PORT,
        MAIL_SERVER=settings.SMTP_HOST,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
    )


def _fmt(amount: Decimal) -> str:
    return f"{amount:,.2f} MKD"


def _items_rows(order: OrderOut) -> str:
    rows = []
    for item in order.items:
        rows.append(
            f"""
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid {_BORDER};color:{_TEXT};font-size:14px;">
                {item.product_name}
                <div style="color:{_MUTED};font-size:12px;margin-top:2px;">SKU: {item.product_sku}</div>
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid {_BORDER};color:{_MUTED};font-size:14px;text-align:center;">
                {item.quantity}
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid {_BORDER};color:{_MUTED};font-size:14px;text-align:right;">
                {_fmt(item.unit_price)}
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid {_BORDER};color:{_TEXT};font-size:14px;font-weight:600;text-align:right;">
                {_fmt(item.subtotal)}
              </td>
            </tr>"""
        )
    return "".join(rows)


def _notes_block(order: OrderOut) -> str:
    if not order.notes:
        return ""
    return f"""
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr>
            <td style="padding:16px;background:{_SURFACE};border:1px solid {_BORDER};border-radius:6px;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">
                Order Notes
              </p>
              <p style="margin:0;font-size:14px;color:{_TEXT};">{order.notes}</p>
            </td>
          </tr>
        </table>"""


def _base_template(preheader: str, content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Handmade by Caci</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <span style="display:none;font-size:1px;color:#f4f4f5;max-height:0;overflow:hidden;">{preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:{_BRAND_COLOR};padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">
                Handmade by Caci
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#fff8f9;opacity:.9;">
                handmade.caci@gmail.com
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              {content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:{_SURFACE};border-top:1px solid {_BORDER};padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:{_MUTED};">
                Handmade by Caci &nbsp;·&nbsp; handmade.caci@gmail.com
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:{_MUTED};">
                Thank you for supporting handmade craftsmanship.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _customer_body(order: OrderOut) -> str:
    addr = order.shipping_address
    line2 = f"<div>{addr.get('line2')}</div>" if addr.get("line2") else ""

    return f"""
      <h1 style="margin:0 0 4px;font-size:22px;color:{_TEXT};">Thank you, {order.customer_name}!</h1>
      <p style="margin:0 0 24px;font-size:14px;color:{_MUTED};">
        We've received your order and will get in touch if we have any questions.
      </p>

      <!-- Order meta -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:14px 16px;background:{_SURFACE};border:1px solid {_BORDER};border-radius:6px 0 0 6px;width:50%;">
            <p style="margin:0;font-size:11px;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">Order Number</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:{_TEXT};">{order.order_number}</p>
          </td>
          <td style="padding:14px 16px;background:{_SURFACE};border:1px solid {_BORDER};border-left:none;border-radius:0 6px 6px 0;width:50%;">
            <p style="margin:0;font-size:11px;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">Order Date</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:{_TEXT};">{order.created_at.strftime('%d %b %Y')}</p>
          </td>
        </tr>
      </table>

      <!-- Items table -->
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">Items Ordered</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid {_BORDER};border-radius:6px;overflow:hidden;">
        <thead>
          <tr style="background:{_SURFACE};">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:{_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Product</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:{_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:{_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:{_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {_items_rows(order)}
        </tbody>
        <tfoot>
          <tr style="background:{_SURFACE};">
            <td colspan="3" style="padding:12px;text-align:right;font-size:14px;font-weight:600;color:{_TEXT};">Total</td>
            <td style="padding:12px;text-align:right;font-size:16px;font-weight:700;color:{_BRAND_DARK};">{_fmt(order.total_amount)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Shipping address -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr>
          <td style="padding:16px;background:{_SURFACE};border:1px solid {_BORDER};border-radius:6px;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">
              Shipping Address
            </p>
            <p style="margin:0;font-size:14px;color:{_TEXT};line-height:1.6;">
              {order.customer_name}<br />
              {addr.get('line1')}<br />
              {line2}
              {addr.get('city')}, {addr.get('postal_code')}<br />
              {addr.get('country')}
            </p>
          </td>
        </tr>
      </table>

      {_notes_block(order)}

      <p style="margin:28px 0 0;font-size:14px;color:{_MUTED};line-height:1.6;">
        If you have any questions about your order, reply to this email and we'll get back to you as soon as possible.
      </p>"""


def _admin_body(order: OrderOut) -> str:
    addr = order.shipping_address
    line2 = f"<div>{addr.get('line2')}</div>" if addr.get("line2") else ""

    return f"""
      <h1 style="margin:0 0 4px;font-size:20px;color:{_TEXT};">New Order Received</h1>
      <p style="margin:0 0 24px;font-size:14px;color:{_MUTED};">
        A new order has been placed on the shop.
      </p>

      <!-- Order meta -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:14px 16px;background:{_SURFACE};border:1px solid {_BORDER};border-radius:6px 0 0 6px;width:50%;">
            <p style="margin:0;font-size:11px;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">Order Number</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:{_TEXT};">{order.order_number}</p>
          </td>
          <td style="padding:14px 16px;background:{_SURFACE};border:1px solid {_BORDER};border-left:none;border-radius:0 6px 6px 0;width:50%;">
            <p style="margin:0;font-size:11px;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">Total</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:{_BRAND_DARK};">{_fmt(order.total_amount)}</p>
          </td>
        </tr>
      </table>

      <!-- Customer details -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:16px;background:{_SURFACE};border:1px solid {_BORDER};border-radius:6px;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">
              Customer
            </p>
            <p style="margin:0;font-size:14px;color:{_TEXT};line-height:1.8;">
              <strong>{order.customer_name}</strong><br />
              {order.customer_email}<br />
              {order.customer_phone or 'No phone provided'}<br />
              <br />
              {addr.get('line1')}<br />
              {line2}
              {addr.get('city')}, {addr.get('postal_code')}<br />
              {addr.get('country')}
            </p>
          </td>
        </tr>
      </table>

      <!-- Items table -->
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:{_MUTED};text-transform:uppercase;letter-spacing:.5px;">Items</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid {_BORDER};border-radius:6px;overflow:hidden;">
        <thead>
          <tr style="background:{_SURFACE};">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:{_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Product</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:{_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:{_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:{_MUTED};font-weight:600;text-transform:uppercase;letter-spacing:.4px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {_items_rows(order)}
        </tbody>
        <tfoot>
          <tr style="background:{_SURFACE};">
            <td colspan="3" style="padding:12px;text-align:right;font-size:14px;font-weight:600;color:{_TEXT};">Total</td>
            <td style="padding:12px;text-align:right;font-size:16px;font-weight:700;color:{_BRAND_DARK};">{_fmt(order.total_amount)}</td>
          </tr>
        </tfoot>
      </table>

      {_notes_block(order)}"""


async def send_customer_confirmation(order: OrderOut) -> None:
    if not settings.SMTP_HOST or not settings.MAIL_FROM:
        return
    try:
        from fastapi_mail import FastMail, MessageSchema

        html = _base_template(
            preheader=f"Your order {order.order_number} has been received.",
            content=_customer_body(order),
        )
        message = MessageSchema(
            subject=f"Order Confirmation — {order.order_number}",
            recipients=[order.customer_email],
            body=html,
            subtype="html",
        )
        await FastMail(_build_conf()).send_message(message)
    except Exception:
        logger.exception("Failed to send customer confirmation for %s", order.order_number)


async def send_admin_notification(order: OrderOut) -> None:
    if not settings.SMTP_HOST or not settings.ADMIN_EMAIL:
        return
    try:
        from fastapi_mail import FastMail, MessageSchema

        html = _base_template(
            preheader=f"New order {order.order_number} from {order.customer_name}.",
            content=_admin_body(order),
        )
        message = MessageSchema(
            subject=f"New Order — {order.order_number} | {order.customer_name}",
            recipients=[settings.ADMIN_EMAIL],
            body=html,
            subtype="html",
        )
        await FastMail(_build_conf()).send_message(message)
    except Exception:
        logger.exception("Failed to send admin notification for %s", order.order_number)
