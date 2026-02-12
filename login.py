from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import smtplib
import time
from email.mime.text import MIMEText

router = APIRouter(prefix="/api/auth", tags=["auth"])

AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "dev-secret-change-this")
MAGIC_LINK_TTL_SECONDS = 15 * 60
SESSION_TTL_SECONDS = 30 * 24 * 60 * 60

# In-memory nonce tracking (single-use magic links)
issued_magic_nonces: Dict[str, int] = {}
used_magic_nonces = set()


class RequestLoginRequest(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None
    frontend_base_url: Optional[str] = None


class RequestLoginResponse(BaseModel):
    message: str
    dev_magic_link: Optional[str] = None
    session_token: Optional[str] = None
    expires_at: Optional[int] = None
    phone_number: Optional[str] = None


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(data: str) -> str:
    digest = hmac.new(AUTH_SECRET_KEY.encode("utf-8"), data.encode("utf-8"), hashlib.sha256).digest()
    return _b64url_encode(digest)


def _create_token(payload: Dict[str, str]) -> str:
    payload_str = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    encoded = _b64url_encode(payload_str.encode("utf-8"))
    sig = _sign(encoded)
    return f"{encoded}.{sig}"


def _verify_token(token: str, expected_type: str) -> Dict[str, str]:
    try:
        encoded, sig = token.split(".", 1)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid token format") from exc

    if not hmac.compare_digest(_sign(encoded), sig):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    try:
        payload = json.loads(_b64url_decode(encoded).decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token payload") from exc

    if payload.get("typ") != expected_type:
        raise HTTPException(status_code=401, detail="Invalid token type")

    exp = int(payload.get("exp", 0))
    if time.time() > exp:
        raise HTTPException(status_code=401, detail="Token expired")

    return payload


def _is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def _is_valid_e164(phone: str) -> bool:
    # E.164 international phone format: +[country][subscriber], max 15 digits.
    return bool(re.match(r"^\+[1-9]\d{6,14}$", phone))


def _send_magic_link_email(to_email: str, magic_link: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    from_email = os.getenv("SMTP_FROM", smtp_user or "no-reply@example.com")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

    if not smtp_host:
        return False

    subject = "Your login link for Elderly Care AI"
    body = (
        "Hello,\n\n"
        "Click the button/link below to log in to Elderly Care AI:\n\n"
        f"{magic_link}\n\n"
        "This link expires in 15 minutes and can be used only once.\n"
    )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        if use_tls:
            server.starttls()
        if smtp_user and smtp_pass:
            server.login(smtp_user, smtp_pass)
        server.sendmail(from_email, [to_email], msg.as_string())

    return True


def get_current_user_identity(authorization: Optional[str] = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")
    token = authorization.split(" ", 1)[1].strip()
    payload = _verify_token(token, "session")
    identity = payload.get("email") or payload.get("phone_number")
    if not identity:
        raise HTTPException(status_code=401, detail="Invalid session payload")
    return identity


@router.post("/request-login", response_model=RequestLoginResponse)
async def request_login(request: RequestLoginRequest):
    # Phone-based login for now (OTP ready later): issue 30-day session directly.
    if request.phone_number:
        phone = request.phone_number.strip()
        if not _is_valid_e164(phone):
            raise HTTPException(
                status_code=400,
                detail="Enter a valid international phone number (e.g. +14155552671)",
            )
        exp = int(time.time()) + SESSION_TTL_SECONDS
        session_payload = {
            "typ": "session",
            "phone_number": phone,
            "exp": exp,
            "sid": secrets.token_urlsafe(16),
        }
        session_token = _create_token(session_payload)
        return RequestLoginResponse(
            message="Phone login successful (OTP step will be added later).",
            session_token=session_token,
            expires_at=exp,
            phone_number=phone,
        )

    email = (request.email or "").strip().lower()
    if not _is_valid_email(email):
        raise HTTPException(status_code=400, detail="Provide a valid email or phone number")

    nonce = secrets.token_urlsafe(16)
    nonce_exp = int(time.time()) + MAGIC_LINK_TTL_SECONDS
    issued_magic_nonces[nonce] = nonce_exp

    magic_payload = {
        "typ": "magic",
        "email": email,
        "exp": nonce_exp,
        "nonce": nonce,
    }
    token = _create_token(magic_payload)

    frontend_base = (request.frontend_base_url or os.getenv("FRONTEND_BASE_URL") or "http://localhost:5173").rstrip("/")
    magic_link = f"{frontend_base}/auth/verify?token={token}"

    sent = False
    try:
        sent = _send_magic_link_email(email, magic_link)
    except Exception as e:
        print(f"Failed to send email: {e}")

    if not sent:
        print(f"[DEV MAGIC LINK] {email}: {magic_link}")
        return RequestLoginResponse(
            message="Login link generated. SMTP not configured, using dev link.",
            dev_magic_link=magic_link,
        )

    return RequestLoginResponse(message="We sent you a login link. Please check your email.")


@router.get("/verify")
async def verify_login_token(token: str):
    payload = _verify_token(token, "magic")
    email = payload["email"]
    nonce = payload.get("nonce")

    if not nonce or nonce not in issued_magic_nonces:
        raise HTTPException(status_code=401, detail="Invalid or unknown magic link")
    if nonce in used_magic_nonces:
        raise HTTPException(status_code=401, detail="Magic link already used")
    if time.time() > issued_magic_nonces[nonce]:
        raise HTTPException(status_code=401, detail="Magic link expired")

    used_magic_nonces.add(nonce)
    del issued_magic_nonces[nonce]

    exp = int(time.time()) + SESSION_TTL_SECONDS
    session_payload = {
        "typ": "session",
        "email": email,
        "exp": exp,
        "sid": secrets.token_urlsafe(16),
    }
    session_token = _create_token(session_payload)

    return {
        "session_token": session_token,
        "email": email,
        "expires_at": exp,
    }


@router.get("/me")
async def auth_me(authorization: Optional[str] = Header(default=None)):
    identity = get_current_user_identity(authorization)
    if identity.startswith("+"):
        return {"phone_number": identity}
    return {"email": identity}
