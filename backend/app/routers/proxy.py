"""API 測試代打 proxy — 原 com.tmic.bobatea.service.ProxyService 的 Python 移植。

行為對齊 Java 版：組 URL（path/query params）、auth headers、body，
回傳 {status, statusText, headers, body, durationMs, error}。
新增 Java 版沒有的 SSRF 基本防護（拒打私有網段）。
"""
import base64
import ipaddress
import json
import socket
import time
from urllib.parse import quote, urlsplit

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class KeyValuePair(BaseModel):
    id: str = ""
    key: str = ""
    value: str = ""
    enabled: bool = True


class AuthConfig(BaseModel):
    type: str = "none"
    bearerToken: str | None = None
    basicUsername: str | None = None
    basicPassword: str | None = None
    apiKeyHeader: str | None = None
    apiKeyValue: str | None = None


class RequestConfig(BaseModel):
    id: str = ""
    name: str = ""
    description: str | None = None
    method: str = "GET"
    url: str
    queryParams: list[KeyValuePair] = Field(default_factory=list)
    pathParams: list[KeyValuePair] = Field(default_factory=list)
    headers: list[KeyValuePair] = Field(default_factory=list)
    bodyType: str = "none"
    bodyJson: str = ""
    auth: AuthConfig = Field(default_factory=AuthConfig)


def build_url(cfg: RequestConfig) -> str:
    url = cfg.url
    for p in cfg.pathParams:
        if p.enabled and p.key:
            url = url.replace("{%s}" % p.key, quote(p.value, safe=""))
            url = url.replace(":%s" % p.key, quote(p.value, safe=""))
    qs = "&".join(f"{quote(p.key, safe='')}={quote(p.value, safe='')}"
                  for p in cfg.queryParams if p.enabled and p.key)
    if qs:
        url += ("&" if "?" in url else "?") + qs
    return url


def build_headers(cfg: RequestConfig) -> dict[str, str]:
    h = {p.key: p.value for p in cfg.headers if p.enabled and p.key}
    a = cfg.auth
    if a.type == "bearer" and a.bearerToken:
        h["Authorization"] = f"Bearer {a.bearerToken}"
    elif a.type == "basic" and a.basicUsername:
        creds = base64.b64encode(f"{a.basicUsername}:{a.basicPassword or ''}".encode()).decode()
        h["Authorization"] = f"Basic {creds}"
    elif a.type == "api_key" and a.apiKeyValue:
        h[a.apiKeyHeader or "X-API-Key"] = a.apiKeyValue
    if cfg.bodyType == "json":
        h["Content-Type"] = "application/json"
    elif cfg.bodyType == "form":
        h["Content-Type"] = "application/x-www-form-urlencoded"
    return h


def build_body(cfg: RequestConfig) -> str | None:
    if cfg.bodyType == "json":
        return cfg.bodyJson or None
    if cfg.bodyType == "form":
        return "&".join(f"{quote(p.key, safe='')}={quote(p.value, safe='')}"
                        for p in cfg.queryParams if p.enabled and p.key)
    return None


def _is_private_target(url: str) -> bool:
    """SSRF 防護：拒絕解析到私有 / loopback / link-local 網段的目標。"""
    host = urlsplit(url).hostname or ""
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        return False  # 解析失敗交給 httpx 回報
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            return True
    return False


@router.post("/proxy")
async def proxy(cfg: RequestConfig) -> dict:
    url = build_url(cfg)
    if not url.startswith(("http://", "https://")):
        return _err(0, "URL 必須以 http:// 或 https:// 開頭", 0)
    if _is_private_target(url):
        return _err(0, "已阻擋指向內部網段的請求（SSRF 防護）", 0)

    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.request(cfg.method, url,
                                        headers=build_headers(cfg),
                                        content=build_body(cfg))
    except httpx.HTTPError as e:
        return _err(0, f"請求失敗: {e}", int((time.monotonic() - start) * 1000))

    duration = int((time.monotonic() - start) * 1000)
    content_type = resp.headers.get("content-type", "")
    body: object = resp.text
    if "json" in content_type:
        try:
            body = resp.json()
        except json.JSONDecodeError:
            pass
    return {
        "status": resp.status_code,
        "statusText": resp.reason_phrase,
        "headers": dict(resp.headers),
        "body": body,
        "durationMs": duration,
        "error": None,
    }


def _err(status: int, msg: str, duration: int) -> dict:
    return {"status": status, "statusText": "", "headers": {},
            "body": None, "durationMs": duration, "error": msg}
