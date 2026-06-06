import logging

from app.core.config import settings
from app.schemas.order import OrderOut

logger = logging.getLogger(__name__)


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


def _items_text(order: OrderOut) -> str:
    return "\n".join(
        f"  {item.product_name} x{item.quantity} — {item.subtotal}" for item in order.items
    )


async def send_customer_confirmation(order: OrderOut) -> None:
    if not settings.SMTP_HOST or not settings.MAIL_FROM:
        return
    try:
        from fastapi_mail import FastMail, MessageSchema

        addr = order.shipping_address
        body = (
            f"Thank you for your order, {order.customer_name}!\n\n"
            f"Order number: {order.order_number}\n"
            f"Total: {order.total_amount}\n\n"
            f"Items:\n{_items_text(order)}\n\n"
            f"Shipping to:\n"
            f"  {addr.get('line1')}\n"
            f"  {addr.get('city')}, {addr.get('postal_code')}\n"
            f"  {addr.get('country')}\n"
        )
        message = MessageSchema(
            subject=f"Order Confirmation — {order.order_number}",
            recipients=[order.customer_email],
            body=body,
            subtype="plain",
        )
        await FastMail(_build_conf()).send_message(message)
    except Exception:
        logger.exception("Failed to send customer confirmation for %s", order.order_number)


async def send_admin_notification(order: OrderOut) -> None:
    if not settings.SMTP_HOST or not settings.ADMIN_EMAIL:
        return
    try:
        from fastapi_mail import FastMail, MessageSchema

        body = (
            f"New order received!\n\n"
            f"Order: {order.order_number}\n"
            f"Customer: {order.customer_name} <{order.customer_email}>\n"
            f"Phone: {order.customer_phone or 'N/A'}\n"
            f"Total: {order.total_amount}\n\n"
            f"Items:\n{_items_text(order)}\n"
        )
        message = MessageSchema(
            subject=f"New Order — {order.order_number}",
            recipients=[settings.ADMIN_EMAIL],
            body=body,
            subtype="plain",
        )
        await FastMail(_build_conf()).send_message(message)
    except Exception:
        logger.exception("Failed to send admin notification for %s", order.order_number)
