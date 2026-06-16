#!/usr/bin/env python3
"""
DriveClear study dev server.

Why this exists (not just `python3 -m http.server`):
  • No-cache headers on every response, so editing js/profile.js, app.js, or
    css/styles.css is reflected on a plain refresh — no stale participant
    profile bleeding into the next session, no cache-busting query strings.
  • Multi-threaded, so a browser keep-alive connection can't block other
    requests (the default server is single-threaded and appears to "hang").

Usage:  python3 serve.py [port]   (defaults to 8000)
"""
import socket
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def _strip_conditionals(self):
        # Defeat 304 Not Modified: drop conditional headers so the browser's
        # stale cached copy can never be revalidated/reused. Always full 200.
        for h in ("If-Modified-Since", "If-None-Match"):
            if h in self.headers:
                del self.headers[h]

    def do_GET(self):
        self._strip_conditionals()
        super().do_GET()

    def do_HEAD(self):
        self._strip_conditionals()
        super().do_HEAD()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


# Dual-stack server so both http://localhost (IPv6 ::1) and 127.0.0.1 (IPv4)
# resolve — the default single-family bind caused "connection refused" when the
# browser reached for ::1.
class DualStackServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        super().server_bind()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = DualStackServer(("", port), NoCacheHandler)
    print(f"DriveClear dev server (no-cache) on http://localhost:{port}")
    print("Edit profile.js / app.js / styles.css and just refresh — no caching.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
        server.shutdown()


if __name__ == "__main__":
    main()
