"""
OSINT Router — IP geolocation, Domain WHOIS, and Social Media username lookup.
"""

import httpx
import socket
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/osint", tags=["OSINT Intelligence"])


# ── Schemas ────────────────────────────────────────────

class IPLookupResponse(BaseModel):
    ip: str
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    zip: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    timezone: Optional[str] = None
    isp: Optional[str] = None
    org: Optional[str] = None
    as_number: Optional[str] = None
    status: str = "success"


class DomainLookupResponse(BaseModel):
    domain: str
    ip: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    isp: Optional[str] = None
    org: Optional[str] = None
    status: str = "success"


class PlatformResult(BaseModel):
    platform: str
    url: str
    exists: bool
    status_code: Optional[int] = None


class UsernameLookupResponse(BaseModel):
    username: str
    results: list[PlatformResult] = []
    total_found: int = 0


# ── IP Geolocation ─────────────────────────────────────

@router.get("/ip/{ip}", response_model=IPLookupResponse)
async def lookup_ip(
    ip: str,
    current_user: User = Depends(get_current_user),
):
    """
    Geolocate an IP address using ip-api.com.
    Returns country, city, ISP, lat/lon.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "status,message,country,countryCode,region,city,zip,lat,lon,timezone,isp,org,as"}
            )
            data = res.json()

        if data.get("status") == "fail":
            raise HTTPException(status_code=400, detail=data.get("message", "Invalid IP"))

        return IPLookupResponse(
            ip=ip,
            country=data.get("country"),
            country_code=data.get("countryCode"),
            region=data.get("region"),
            city=data.get("city"),
            zip=data.get("zip"),
            lat=data.get("lat"),
            lon=data.get("lon"),
            timezone=data.get("timezone"),
            isp=data.get("isp"),
            org=data.get("org"),
            as_number=data.get("as"),
            status="success",
        )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach IP API: {str(e)}")


# ── Domain Lookup ──────────────────────────────────────

@router.get("/domain/{domain}", response_model=DomainLookupResponse)
async def lookup_domain(
    domain: str,
    current_user: User = Depends(get_current_user),
):
    """
    Resolve a domain to IP and geolocate it.
    Returns IP, country, city, ISP, lat/lon.
    """
    # Resolve domain to IP
    try:
        ip = socket.gethostbyname(domain)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail=f"Cannot resolve domain: {domain}")

    # Geolocate the resolved IP
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "status,country,city,lat,lon,isp,org"}
            )
            data = res.json()

        return DomainLookupResponse(
            domain=domain,
            ip=ip,
            country=data.get("country"),
            city=data.get("city"),
            lat=data.get("lat"),
            lon=data.get("lon"),
            isp=data.get("isp"),
            org=data.get("org"),
            status="success",
        )
    except httpx.RequestError:
        return DomainLookupResponse(domain=domain, ip=ip, status="partial")


# ── Social Media Username Search ───────────────────────

PLATFORMS = [
    {"name": "GitHub",    "url": "https://github.com/{username}"},
    {"name": "Twitter/X", "url": "https://x.com/{username}"},
    {"name": "Instagram", "url": "https://www.instagram.com/{username}/"},
    {"name": "Reddit",    "url": "https://www.reddit.com/user/{username}"},
    {"name": "TikTok",    "url": "https://www.tiktok.com/@{username}"},
    {"name": "LinkedIn",  "url": "https://www.linkedin.com/in/{username}"},
    {"name": "YouTube",   "url": "https://www.youtube.com/@{username}"},
    {"name": "Pinterest", "url": "https://www.pinterest.com/{username}/"},
    {"name": "Twitch",    "url": "https://www.twitch.tv/{username}"},
    {"name": "Medium",    "url": "https://medium.com/@{username}"},
]


@router.get("/username/{username}", response_model=UsernameLookupResponse)
async def lookup_username(
    username: str,
    current_user: User = Depends(get_current_user),
):
    """
    Check username availability across social media platforms.
    Performs HEAD/GET requests to detect if profiles exist.
    """
    results: list[PlatformResult] = []

    async with httpx.AsyncClient(
        timeout=8.0,
        follow_redirects=True,
        headers={"User-Agent": "Mozilla/5.0 (compatible; VAPOR-SCAN/2.0)"},
    ) as client:
        for platform in PLATFORMS:
            url = platform["url"].format(username=username)
            try:
                resp = await client.head(url)
                # Most platforms return 200 for existing profiles, 404 for missing
                exists = resp.status_code == 200
                results.append(PlatformResult(
                    platform=platform["name"],
                    url=url,
                    exists=exists,
                    status_code=resp.status_code,
                ))
            except (httpx.RequestError, httpx.HTTPStatusError):
                results.append(PlatformResult(
                    platform=platform["name"],
                    url=url,
                    exists=False,
                    status_code=None,
                ))

    total_found = sum(1 for r in results if r.exists)
    return UsernameLookupResponse(
        username=username,
        results=results,
        total_found=total_found,
    )
